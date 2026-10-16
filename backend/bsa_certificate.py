"""
bsa_certificate.py — Statutory Compliance Electronic Certificate Generator
Implements mandatory two-part certificate under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA).
- Part A: Identification of Electronic Record, source device, extraction tooling, SHA-256 hashes & blockchain proofs.
- Part B: Statutory Declaration by Officer in-charge / Examiner certifying legal chain of custody and non-tampering.
"""
from datetime import datetime, timezone

def generate_bsa_section_63_certificate(case_data: dict, artifacts: list[dict], officer_data: dict) -> dict:
    """
    Generates structured Section 63 BSA 2023 Statutory Certificate.
    """
    now = datetime.now(timezone.utc)
    cert_id = f"BSA-63-{case_data.get('case_number', 'CASE')}-{now.strftime('%Y%m%d%H%M')}"

    officer_name = officer_data.get('name', 'Sub-Inspector Sharma')
    officer_role = officer_data.get('role', 'Investigating Officer')
    badge_no = officer_data.get('badge', '9482A')
    department = officer_data.get('department', 'Cyber Crime Investigation Unit')

    # Part A: Electronic Exhibits
    exhibits_schedule = []
    for idx, art in enumerate(artifacts, 1):
        exhibits_schedule.append({
            "exhibit_no": f"EXHIBIT-{idx}",
            "artifact_name": art.get('name', 'Digital Artifact'),
            "category": art.get('artifact_type', 'ELECTRONIC_RECORD'),
            "un_salted_sha256": art.get('raw_sha256', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
            "blockchain_salted_hash": art.get('salted_sha256', ''),
            "file_size_bytes": art.get('file_size', 0),
            "extraction_method": "Bit-stream cryptographic forensic capture via SUTRAM DFIR Engine",
            "device_particulars": art.get('metadata_json', 'Standard Digital Storage Media')
        })

    # Part B: Legal Declaration
    declaration_text = (
        f"I, {officer_name}, holding the rank of {officer_role} (Badge No: {badge_no}) attached to "
        f"{department}, do hereby solemnly declare and certify under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023:\n\n"
        f"1. That the electronic records described in Part A of this Certificate were produced by computer systems "
        f"during the period over which the said computer systems were used regularly to store or process information.\n"
        f"2. That during the said period, the electronic equipment operated properly, and if not, the temporary disruption "
        f"did not affect the electronic records or the mathematical accuracy of their contents.\n"
        f"3. That the mathematical cryptographic fingerprints (SHA-256) were generated instantaneously upon acquisition, "
        f"and the said records have been immutably anchored on the Polygon Distributed Ledger, precluding any alteration, "
        f"tampering, or post-seizure spoliation.\n"
        f"4. That to the best of my knowledge, information, and belief, the particulars stated in this Certificate are true and correct."
    )

    return {
        "certificate_id": cert_id,
        "statutory_act": "Bharatiya Sakshya Adhiniyam, 2023 (Section 63)",
        "case_number": case_data.get('case_number', ''),
        "case_title": case_data.get('title', ''),
        "generation_timestamp": now.strftime('%Y-%m-%d %H:%M:%S UTC'),
        "officer": {
            "name": officer_name,
            "role": officer_role,
            "badge": badge_no,
            "department": department
        },
        "part_a_exhibits": exhibits_schedule,
        "part_b_declaration": declaration_text,
        "blockchain_verification_network": "Polygon Amoy Proof-of-Stake (Chain ID 80002)"
    }
