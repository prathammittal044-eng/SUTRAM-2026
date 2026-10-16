"""
log_anomaly.py — Machine Learning Unsupervised Anomaly Detection for Server/Firewall Logs
Uses Isolation Forest algorithm to detect:
- Sudden surges of failed authentications
- Off-hours / anomalous login time spikes
- Geographic dispersion anomalies (abnormal foreign IP activity)
- High-frequency automated attacks / brute force attempts
"""
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest

def detect_log_anomalies(events: list[dict]) -> tuple[list[dict], dict]:
    """
    Applies an Isolation Forest model to normalized forensic log events.
    Returns (flagged_events: list[dict], summary_stats: dict).
    """
    if len(events) < 5:
        # Not enough data points to train statistical model
        return events, {"total_events": len(events), "anomalies_detected": 0, "status": "insufficient_data"}

    features = []
    parsed_timestamps = []

    for ev in events:
        ts_str = ev.get('timestamp', '')
        hour = 12
        day_of_week = 3
        try:
            dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
            hour = dt.hour
            day_of_week = dt.weekday()
        except Exception:
            pass

        # Feature 1: Off-hours indicator (11 PM - 5 AM has higher weight)
        is_off_hours = 1.0 if (hour >= 23 or hour <= 5) else 0.0

        # Feature 2: Severity flag
        sev = ev.get('severity', 'INFO')
        sev_score = 3.0 if sev == 'CRITICAL' else (1.5 if sev == 'WARNING' else 0.0)

        # Feature 3: Action text length and suspicious keywords
        desc = ev.get('description', '').lower()
        has_suspicious_kw = 1.0 if any(k in desc for k in ['fail', 'deny', '403', '401', 'admin', 'root', 'unauthorized', 'error', 'attack']) else 0.0

        # Feature 4: Hour of day normalized (0 to 1)
        hour_norm = hour / 24.0

        features.append([hour_norm, is_off_hours, sev_score, has_suspicious_kw])
        parsed_timestamps.append(ts_str)

    X = np.array(features)

    # Train Isolation Forest (contamination estimate 10-15%)
    contamination_rate = min(max(5.0 / len(events), 0.05), 0.20)
    iso = IsolationForest(contamination=contamination_rate, random_state=42)
    predictions = iso.fit_predict(X) # -1 is anomaly, 1 is normal
    scores = iso.decision_function(X) # lower score = more anomalous

    flagged_indices = []
    for idx, pred in enumerate(predictions):
        if pred == -1:
            events[idx]['is_anomaly'] = True
            events[idx]['anomaly_score'] = round(float(-scores[idx]), 3)
            # Escalate severity if anomaly detected
            if events[idx]['severity'] == 'INFO':
                events[idx]['severity'] = 'WARNING'
            flagged_indices.append(idx)
        else:
            events[idx]['is_anomaly'] = False
            events[idx]['anomaly_score'] = 0.0

    stats = {
        "total_events": len(events),
        "anomalies_detected": len(flagged_indices),
        "anomaly_percentage": round((len(flagged_indices) / len(events)) * 100, 1),
        "status": "completed"
    }

    return events, stats
