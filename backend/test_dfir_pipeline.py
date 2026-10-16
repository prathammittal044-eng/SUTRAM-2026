"""
test_dfir_pipeline.py — End-to-End Verification of SUTRAM 2026 Forensics Pipeline
Tests all 4 technical pillars and workflow stages:
1. Format-Agnostic Parsers (SQLite mobile DB, CSV firewall log, WhatsApp chat)
2. AI Forgery Lab (Error Level Analysis ELA & Tamper Scoring)
3. Metadata Forensics (EXIF, GPS, Software tags)
4. ML Log Anomaly Triage (Isolation Forest)
5. Entity Extraction & Correlation (Knowledge Graph generation)
6. AI Hypothesis & Reasoning Engine (Adversarial challenge & leads)
7. Section 63 BSA 2023 Statutory Certificate Generation
"""
import io
import os
import json
import sqlite3
import numpy as np
from PIL import Image, ImageDraw

import parsers
import image_forgery
import metadata_forensics
import log_anomaly
import correlation_engine
import investigative_ai
import bsa_certificate

def test_1_parsers():
    print("\n[TEST 1] Testing Format-Agnostic Parsers...")
    
    # 1.1 In-memory SQLite mobile DB test
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tf:
        tf_name = tf.name
    conn = sqlite3.connect(tf_name)
    cur = conn.cursor()
    cur.execute("CREATE TABLE messages (id INTEGER, sender TEXT, body TEXT, timestamp TEXT);")
    cur.execute("INSERT INTO messages VALUES (1, '+919876543210', 'Transfer 50000 INR to victim@okhdfcbank immediately or account blocked', '2026-10-09 14:02:15');")
    cur.execute("INSERT INTO messages VALUES (2, '+919876543210', 'Use OTP 849201', '2026-10-09 14:03:00');")
    conn.commit()
    conn.close()
    with open(tf_name, 'rb') as f:
        db_bytes = f.read()
    os.remove(tf_name)

    art_type, events, summary = parsers.detect_and_parse_artifact(db_bytes, "mobile_dump.sqlite")
    assert art_type == "MOBILE_DB", f"Expected MOBILE_DB, got {art_type}"
    assert len(events) == 2, f"Expected 2 events, got {len(events)}"
    assert events[0]['actor'] == '+919876543210', "Failed to extract actor"
    print("  -> SQLite Parser: PASSED (Extracted 2 mobile chat events)")

    # 1.2 CSV Firewall Log test
    csv_content = """timestamp,src_ip,dst_ip,action,status
2026-10-09T14:10:00Z,185.220.101.5,192.168.1.100,AUTH_LOGIN,401
2026-10-09T14:10:02Z,185.220.101.5,192.168.1.100,AUTH_LOGIN,401
2026-10-09T14:10:04Z,185.220.101.5,192.168.1.100,EXPLOIT_/etc/passwd,CRITICAL
"""
    art_type, log_events, summary = parsers.detect_and_parse_artifact(csv_content.encode(), "firewall_traffic.csv")
    assert art_type == "NETWORK_LOG", f"Expected NETWORK_LOG, got {art_type}"
    assert len(log_events) == 3, f"Expected 3 events, got {len(log_events)}"
    assert log_events[2]['severity'] == "CRITICAL", "Critical exploit payload not flagged"
    print("  -> CSV Firewall Parser: PASSED (Extracted 3 log events with severity triage)")

    # 1.3 WhatsApp Chat Export test
    wa_chat = """[09/10/26, 14:15:20] Extortionist: Pay Rs 25,000 to fraudster@paytm or face arrest
[09/10/26, 14:16:00] Victim: Please give me some time
"""
    art_type, chat_events, summary = parsers.detect_and_parse_artifact(wa_chat.encode(), "whatsapp_chat.txt")
    assert art_type == "CHAT_EXPORT", f"Expected CHAT_EXPORT, got {art_type}"
    assert len(chat_events) == 2, f"Expected 2 chat events, got {len(chat_events)}"
    assert chat_events[0]['severity'] == "WARNING", "Urgent threat/extortion keyword not escalated"
    print("  -> WhatsApp Chat Parser: PASSED (Extracted 2 messages with threat classification)")

def test_2_image_forgery():
    print("\n[TEST 2] Testing Image Forgery Lab (Error Level Analysis)...")
    
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Create a synthetic image with spliced high-contrast text modification
    img = Image.new('RGB', (300, 150), color=(240, 240, 240))
    d = ImageDraw.Draw(img)
    d.text((20, 30), "Genuine Transaction ID: UPI-998822", fill=(20, 20, 20))
    
    # Save base JPEG at 70% quality (simulating downloaded receipt)
    base_buf = io.BytesIO()
    img.save(base_buf, 'JPEG', quality=70)
    base_buf.seek(0)
    reloaded = Image.open(base_buf)

    # Splice an altered digit "1" over the "9" with 100% quality overlay
    d2 = ImageDraw.Draw(reloaded)
    d2.rectangle([(160, 28), (240, 48)], fill=(240, 240, 240))
    d2.text((160, 30), "FORGED-ID-001", fill=(255, 0, 0))

    spliced_buf = io.BytesIO()
    reloaded.save(spliced_buf, 'JPEG', quality=100)
    spliced_bytes = spliced_buf.getvalue()

    res = image_forgery.analyze_image_forgery(spliced_bytes, "spliced_receipt.jpg", upload_dir)
    assert res['status'] == 'success', "ELA execution failed"
    assert 'tamper_score' in res, "Missing tamper score"
    assert 'ela_image_file' in res, "Missing ELA visualization path"
    print(f"  -> ELA Score on Spliced Receipt: {res['tamper_score']}% (Is Tampered: {res['is_tampered']})")
    print("  -> Image Forgery Engine: PASSED")

def test_3_metadata_forensics():
    print("\n[TEST 3] Testing EXIF & Metadata Extraction...")
    
    img = Image.new('RGB', (100, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, 'JPEG')
    meta = metadata_forensics.extract_image_metadata(buf.getvalue())
    assert isinstance(meta, dict), "Invalid metadata output"
    assert "suspicious_indicators" in meta
    print("  -> EXIF/Metadata Extraction: PASSED")

def test_4_log_anomaly_isolation_forest():
    print("\n[TEST 4] Testing ML Isolation Forest Log Anomaly Detection...")
    
    # Generate 40 normal daytime events and 3 anomalous off-hours bursts
    events = []
    for i in range(40):
        events.append({
            "timestamp": f"2026-10-09T{10 + (i // 10):02d}:{i % 60:02d}:00Z",
            "severity": "INFO",
            "description": "User session normal heartbeat",
            "actor": "user_alice"
        })
    # 3 off-hours anomalies
    for i in range(4):
        events.append({
            "timestamp": "2026-10-09T03:14:02Z",
            "severity": "CRITICAL",
            "description": "401 Unauthorized root login brute force failed",
            "actor": "185.220.101.5"
        })

    flagged_events, stats = log_anomaly.detect_log_anomalies(events)
    assert stats['anomalies_detected'] > 0, "Failed to flag anomalies"
    assert stats['status'] == 'completed'
    print(f"  -> Isolation Forest Output: Flagged {stats['anomalies_detected']} anomaly events out of {stats['total_events']}.")
    print("  -> ML Log Anomaly Triage: PASSED")

def test_5_entity_correlation_and_graph():
    print("\n[TEST 5] Testing Entity Extraction & Knowledge Graph Generation...")
    
    text = "Suspect called +919876543210 and demanded transfer to mule_account@okhdfcbank from server 185.220.101.5 and email fraud@scam.org"
    ents = correlation_engine.extract_entities_from_text(text, "exhibit_1")
    
    assert "+919876543210" in ents['PHONE'] or "9876543210" in "".join(ents['PHONE']), "Phone extraction failed"
    assert "mule_account@okhdfcbank" in ents['UPI_ID'], "UPI ID extraction failed"
    assert "185.220.101.5" in ents['IP_ADDRESS'], "IP extraction failed"
    assert "fraud@scam.org" in ents['EMAIL'], "Email extraction failed"

    ent_list = [
        {"value": "+919876543210", "entity_type": "PHONE", "occurrences": 3},
        {"value": "mule_account@okhdfcbank", "entity_type": "UPI_ID", "occurrences": 2},
        {"value": "185.220.101.5", "entity_type": "IP_ADDRESS", "occurrences": 5}
    ]
    graph = correlation_engine.build_knowledge_graph(ent_list)
    assert len(graph['nodes']) == 3, f"Expected 3 nodes, got {len(graph['nodes'])}"
    assert len(graph['edges']) > 0, "Expected connecting edges"
    print(f"  -> Graph Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")
    print("  -> Entity Extractor & Knowledge Graph: PASSED")

def test_6_ai_hypothesis_engine():
    print("\n[TEST 6] Testing AI Investigative Reasoning & Hypothesis Engine...")
    
    case_data = {"case_number": "FIR-2026-104", "title": "Cyber Financial Extortion & UPI Siphoning"}
    events = [
        {"description": "Chat message demanding UPI transfer", "event_type": "CHAT_MESSAGE"},
        {"description": "Failed authentication burst on portal", "event_type": "NETWORK_LOG_EVENT"}
    ]
    entities = [
        {"value": "+919876543210", "entity_type": "PHONE"},
        {"value": "target@okhdfcbank", "entity_type": "UPI_ID"}
    ]
    artifacts = [{"name": "chat_log.txt", "artifact_type": "CHAT_EXPORT"}]

    reasoning = investigative_ai.run_investigative_reasoning(case_data, events, entities, artifacts)
    assert reasoning['status'] == 'success'
    assert len(reasoning['hypotheses']) > 0, "No hypotheses generated"
    
    h0 = reasoning['hypotheses'][0]
    assert 'modus_operandi' in h0, "Missing Modus Operandi"
    assert 'counter_arguments' in h0, "Missing Adversarial Challenge"
    assert 'recommended_leads' in h0, "Missing Recommended Leads"
    assert len(h0['recommended_leads']) > 0, "Leads list empty"
    print(f"  -> Generated Hypothesis: '{h0['title']}'")
    print(f"  -> Adversarial Counter: '{h0['counter_arguments'][:60]}...'")
    print("  -> AI Hypothesis Engine: PASSED")

def test_7_bsa_section_63_certificate():
    print("\n[TEST 7] Testing Section 63 BSA 2023 Statutory Certificate Generator...")
    
    case_data = {"case_number": "FIR-2026-104", "title": "Cyber Extortion"}
    artifacts = [
        {
            "name": "chat_export.txt",
            "artifact_type": "CHAT_EXPORT",
            "raw_sha256": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            "salted_sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            "file_size": 4210
        }
    ]
    officer = {
        "name": "Sub-Inspector Sharma",
        "role": "Investigating Officer",
        "badge": "9482A",
        "department": "Cyber Crime Police Station, Delhi"
    }

    cert = bsa_certificate.generate_bsa_section_63_certificate(case_data, artifacts, officer)
    assert "PART A" in cert['statutory_act'] or "63" in cert['statutory_act']
    assert len(cert['part_a_exhibits']) == 1, "Exhibit count mismatch"
    assert cert['part_a_exhibits'][0]['un_salted_sha256'] == "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    assert "Part B" in cert['part_b_declaration'] or "Section 63" in cert['part_b_declaration']
    print(f"  -> Certificate ID: {cert['certificate_id']}")
    print(f"  -> Part A Exhibits: {len(cert['part_a_exhibits'])} | Part B Declaration verified")
    print("  -> Section 63 BSA Statutory Certificate: PASSED")

if __name__ == "__main__":
    print("==================================================================")
    print("   SUTRAM 2026 DFIR FORENSICS FRAMEWORK — UNIT TEST SUITE")
    print("==================================================================")
    test_1_parsers()
    test_2_image_forgery()
    test_3_metadata_forensics()
    test_4_log_anomaly_isolation_forest()
    test_5_entity_correlation_and_graph()
    test_6_ai_hypothesis_engine()
    test_7_bsa_section_63_certificate()
    print("\n==================================================================")
    print("   ALL 7 TESTS COMPLETED SUCCESSFULLY! ZERO FAILURES.")
    print("==================================================================")
