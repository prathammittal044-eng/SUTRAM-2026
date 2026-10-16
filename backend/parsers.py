"""
parsers.py — Format-Agnostic Ingestion Engine for Digital Forensic Artifacts
Natively parses:
- Mobile Phone SQLite Databases (calls, sms, WhatsApp msgstore, contacts)
- Firewall / Web Server / Authentication CSV & Syslogs
- WhatsApp / Telegram Exported Chats (.txt, .json)
"""
import os
import re
import csv
import io
import json
import sqlite3
import tempfile
from datetime import datetime, timezone

def _normalize_iso_timestamp(ts_str: str) -> str:
    """Attempt to parse diverse timestamp formats into standard ISO UTC."""
    if not ts_str:
        return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Check if unix epoch timestamp in milliseconds or seconds
    ts_clean = str(ts_str).strip().split('.')[0]
    if ts_clean.isdigit():
        try:
            val = int(ts_clean)
            if val > 1e11: # milliseconds
                val = val / 1000.0
            return datetime.fromtimestamp(val, tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            pass

    formats = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d %H:%M:%SZ',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%dT%H:%M:%SZ',
        '%d/%m/%Y, %H:%M:%S',
        '%d/%m/%Y, %H:%M',
        '%d/%m/%y, %I:%M:%S %p',
        '%d/%m/%y, %I:%M %p',
        '%d/%m/%Y %H:%M:%S',
        '%b %d %H:%M:%S',
        '%d-%b-%Y %H:%M:%S',
        '%m/%d/%Y %H:%M:%S',
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(str(ts_str).strip(), fmt)
            if dt.year == 1900:
                dt = dt.replace(year=datetime.now().year)
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            continue

    return str(ts_str).strip()

def parse_sqlite_db(file_bytes: bytes, filename: str) -> tuple[list[dict], str]:
    """
    Inspects an uploaded SQLite database (e.g. mobile extractions, call logs, SMS, WhatsApp).
    Returns (events: list[dict], summary_text: str).
    """
    events = []
    summary_lines = [f"=== SQLite Forensics Extraction: {filename} ==="]

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            f.write(file_bytes)
            temp_path = f.name

        conn = sqlite3.connect(temp_path)
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
        sample_tables = tables[:15]
        summary_lines.append(f"Discovered {len(tables)} tables: {sample_tables}")

        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = [col[1].lower() for col in cursor.fetchall()]
            
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            count = cursor.fetchone()[0]
            if count == 0:
                continue

            summary_lines.append(f"- Table '{table}': {count} records")

            time_cols = [c for c in columns if any(k in c for k in ['time', 'date', 'created', 'sent', 'received'])]
            text_cols = [c for c in columns if any(k in c for k in ['text', 'message', 'body', 'content', 'data'])]
            sender_cols = [c for c in columns if any(k in c for k in ['from', 'sender', 'jid', 'phone', 'number', 'user', 'address', 'actor'])]
            target_cols = [c for c in columns if any(k in c for k in ['to', 'recipient', 'target', 'dest'])]

            if text_cols or ('calls' in table.lower() or 'sms' in table.lower()):
                cursor.execute(f"SELECT * FROM {table} LIMIT 250;")
                rows = cursor.fetchall()
                col_names = [col[0].lower() for col in cursor.description]

                for row in rows:
                    r_dict = dict(zip(col_names, row))
                    
                    ts = None
                    for tc in time_cols:
                        if r_dict.get(tc):
                            ts = _normalize_iso_timestamp(str(r_dict[tc]))
                            break
                    if not ts:
                        ts = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

                    content_parts = []
                    for tc in text_cols:
                        if r_dict.get(tc):
                            content_parts.append(str(r_dict[tc]))
                    
                    if not content_parts:
                        content_parts.append(f"Record in {table}: " + ", ".join(f"{k}={v}" for k, v in list(r_dict.items())[:5]))

                    msg_text = " | ".join(content_parts)

                    actor = None
                    for sc in sender_cols:
                        if r_dict.get(sc):
                            actor = str(r_dict[sc])
                            break

                    target = None
                    for tc in target_cols:
                        if r_dict.get(tc):
                            target = str(r_dict[tc])
                            break

                    events.append({
                        'timestamp': ts,
                        'event_type': 'MOBILE_DATABASE_RECORD',
                        'description': f"[{table}] {msg_text}"[:500],
                        'actor': actor or 'Mobile Device User',
                        'target': target,
                        'severity': 'INFO',
                        'source': filename
                    })

        conn.close()
    except Exception as e:
        summary_lines.append(f"Error parsing SQLite DB: {e}")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    return events, "\n".join(summary_lines)

def parse_csv_logs(file_bytes: bytes, filename: str) -> tuple[list[dict], str]:
    """
    Parses firewall, server access, and auth CSV logs.
    Returns (events: list[dict], summary_text: str).
    """
    events = []
    summary_lines = [f"=== Server/Firewall Log Ingestion: {filename} ==="]

    try:
        text_data = file_bytes.decode('utf-8', errors='replace')
        lines = [line.strip() for line in text_data.splitlines() if line.strip()]
        
        if not lines:
            return events, "Empty log file."

        first_line = lines[0]
        delimiter = ','
        for d in [',', '\t', '|', ';']:
            if first_line.count(d) > 2:
                delimiter = d
                break

        reader = csv.reader(lines, delimiter=delimiter)
        header = [h.strip().lower() for h in next(reader)]

        ts_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['time', 'date', 'timestamp', '@timestamp'])), None)
        src_ip_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['src', 'source', 'client', 'remote_ip', 'ip'])), None)
        dst_ip_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['dst', 'dest', 'target', 'server', 'host'])), None)
        user_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['user', 'account', 'username', 'login'])), None)
        action_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['action', 'event', 'status', 'method', 'request', 'uri', 'message'])), None)
        status_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['code', 'status', 'result', 'response'])), None)

        row_count = 0
        critical_count = 0

        for row in reader:
            if not row or len(row) < 2:
                continue
            row_count += 1

            ts = _normalize_iso_timestamp(row[ts_idx]) if (ts_idx is not None and ts_idx < len(row)) else datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
            src = row[src_ip_idx] if (src_ip_idx is not None and src_ip_idx < len(row)) else None
            dst = row[dst_ip_idx] if (dst_ip_idx is not None and dst_ip_idx < len(row)) else None
            user = row[user_idx] if (user_idx is not None and user_idx < len(row)) else None
            action = row[action_idx] if (action_idx is not None and action_idx < len(row)) else 'Log Event'
            status = row[status_idx] if (status_idx is not None and status_idx < len(row)) else ''

            actor = user or src or 'Unknown Host'
            desc = f"{action} [Status: {status}]" if status else action

            severity = 'INFO'
            if any(fail in str(status).lower() or fail in str(action).lower() for fail in ['401', '403', '500', 'deny', 'block', 'failed', 'reject', 'drop']):
                severity = 'WARNING'
            
            if any(crit in str(action).lower() for crit in ['/etc/passwd', 'union select', 'admin', 'drop table', 'powershell', 'exec', 'exploit', 'unauthorized', 'malware']):
                severity = 'CRITICAL'
                critical_count += 1

            events.append({
                'timestamp': ts,
                'event_type': 'NETWORK_LOG_EVENT',
                'description': desc[:500],
                'actor': actor,
                'target': dst,
                'severity': severity,
                'source': filename
            })

        summary_lines.append(f"Successfully parsed {row_count} log entries from {filename}.")
        if critical_count > 0:
            summary_lines.append(f"⚠️ Flagged {critical_count} critical security events.")

    except Exception as e:
        summary_lines.append(f"Error parsing CSV log: {e}")

    return events, "\n".join(summary_lines)

def parse_chat_export(file_bytes: bytes, filename: str) -> tuple[list[dict], str]:
    """
    Parses WhatsApp or Telegram exported conversation logs.
    Returns (events: list[dict], summary_text: str).
    """
    events = []
    summary_lines = [f"=== Chat Forensics Ingestion: {filename} ==="]

    try:
        text = file_bytes.decode('utf-8', errors='replace')
        
        if filename.endswith('.json') or text.strip().startswith('{'):
            try:
                data = json.loads(text)
                msgs = data.get('messages', [])
                for m in msgs:
                    ts = _normalize_iso_timestamp(m.get('date', ''))
                    sender = m.get('from', m.get('actor', 'Unknown'))
                    body = m.get('text', '')
                    if isinstance(body, list):
                        body = " ".join(part.get('text', '') if isinstance(part, dict) else str(part) for part in body)
                    
                    if body:
                        events.append({
                            'timestamp': ts,
                            'event_type': 'CHAT_MESSAGE',
                            'description': str(body)[:500],
                            'actor': str(sender),
                            'target': 'Group/Direct',
                            'severity': 'INFO',
                            'source': filename
                        })
                summary_lines.append(f"Parsed {len(events)} Telegram messages.")
                return events, "\n".join(summary_lines)
            except Exception:
                pass

        wa_patterns = [
            r'^\[?(\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[APMapm]{2})?)\]?\s*[-:]?\s*([^:]+):\s*(.*)$',
        ]

        lines = text.splitlines()
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            matched = False
            for pat in wa_patterns:
                m = re.match(pat, line_str)
                if m:
                    raw_ts, sender, msg = m.groups()
                    ts = _normalize_iso_timestamp(raw_ts)
                    severity = 'INFO'
                    if any(w in msg.lower() for w in ['otp', 'urgent', 'police', 'transfer', 'blocked', 'account', 'pay', 'upi', 'threat', 'arrest']):
                        severity = 'WARNING'
                    
                    events.append({
                        'timestamp': ts,
                        'event_type': 'CHAT_MESSAGE',
                        'description': msg.strip()[:500],
                        'actor': sender.strip(),
                        'target': 'Chat Participant',
                        'severity': severity,
                        'source': filename
                    })
                    matched = True
                    break

            if not matched and events:
                events[-1]['description'] += f" \n{line_str}"

        summary_lines.append(f"Extracted {len(events)} WhatsApp chat messages.")

    except Exception as e:
        summary_lines.append(f"Error parsing chat export: {e}")

    return events, "\n".join(summary_lines)

def detect_and_parse_artifact(file_bytes: bytes, filename: str) -> tuple[str, list[dict], str]:
    """
    Detects artifact category and executes format-specific parsing.
    Returns: (artifact_type: str, events: list[dict], extracted_text: str)
    """
    ext = filename.lower().split('.')[-1]
    
    if ext in ['db', 'sqlite', 'sqlite3', 'db3'] or file_bytes[:16] == b'SQLite format 3\x00':
        events, summary = parse_sqlite_db(file_bytes, filename)
        return 'MOBILE_DB', events, summary

    if ext in ['csv', 'tsv', 'log']:
        events, summary = parse_csv_logs(file_bytes, filename)
        return 'NETWORK_LOG', events, summary

    if 'chat' in filename.lower() or 'whatsapp' in filename.lower() or 'telegram' in filename.lower():
        events, summary = parse_chat_export(file_bytes, filename)
        return 'CHAT_EXPORT', events, summary

    if ext in ['jpg', 'jpeg', 'png', 'bmp', 'webp', 'tiff']:
        return 'MEDIA', [], ''

    return 'DOCUMENT', [], ''
