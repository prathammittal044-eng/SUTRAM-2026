# SUTRAM-2026 Forensic Test Dataset

High-fidelity test dataset for testing the complete end-to-end ingestion and forensic analysis pipeline of **SUTRAM-2026**.

Contains **exactly 2 realistic cybercrime cases** covering all supported DFIR file formats:
- Official Police FIR / Forensic Breach Report (`.pdf`)
- Suspect Communication & Extortion Transcripts (`.txt`)
- Network Authentication & Firewall CSV Logs (`.csv`)
- Seized Mobile / Endpoint Triage Databases (`.sqlite`)
- Forged & Spliced Evidence Images (`.jpg`)
- Crime Scene & Physical Seizure Photos with Real GPS Coordinates (`.jpg`)

---

## Case 1: SIM Swap & Banking Mule Fraud (FIR-2026-402)
**Directory:** `Case_1_SIM_Swap_and_Banking_Fraud/`

### Case Background
Victim Dr. Ananya Sen (+91 9810123456) had her cellular service deactivated via a fraudulent duplicate SIM issuance in Ranchi, Jharkhand. The cyber syndicate then accessed her NetBanking accounts, intercepted 2FA SMS OTPs, and laundered INR 28,50,000 across multiple mule accounts (`vicky.mule@icici`, `cashout99@paytm`, `bunty.hawala@sbi`).

### Exhibit Manifest
1. `01_Police_FIR_and_Bank_Complaint.pdf`: Formal NCRB police FIR under Bharatiya Nyaya Sanhita (BNS) 2023 Sec 318(4)/308(2), IT Act Sec 66C/66D, and BSA 2023 Sec 63 certificate.
2. `02_suspect_whatsapp_chat.txt`: WhatsApp coordination between Vicky Rawat and Bunty Hawala with phone numbers, VPAs, and USDT wallet `0x71C83605F411C618b62A5A281313783a71b87D56`.
3. `03_isp_cdr_and_firewall_logs.csv`: NetBanking authentication logs demonstrating **Impossible Travel Anomaly** (Ranchi IP `103.211.54.12` to Noida IP `45.118.67.89` in under 5 minutes).
4. `04_seized_phone_extraction.sqlite`: SQLite mobile extraction containing `calls`, `messages` (intercepted HDFC OTPs), `contacts`.
5. `05_altered_upi_payment_receipt.jpg`: Forged UPI payment advice with spliced amount (INR 500 edited to INR 5,00,000) and Adobe Photoshop EXIF metadata.
6. `06_seizure_location_photo.jpg`: Raid photograph with embedded GPS coordinates (28.6270° N, 77.3725° E — Sector 62, Noida, UP) and camera metadata (Samsung Galaxy S23 Ultra).

---

## Case 2: Corporate Ransomware & AWS S3 Data Exfiltration (INC-2026-518)
**Directory:** `Case_2_Corporate_Ransomware_and_Data_Exfiltration/`

### Case Background
FinTech unicorn PayVance Technologies (Bengaluru) suffered a ransomware and data extortion breach. Attackers exploited compromised IAM credentials (`AKIAIOSFODNN7EXAMPLE`) via Tor Exit Node `185.220.101.5` and an internal bastion host (`10.0.4.15`), exfiltrated 45 GB of customer KYC archives from S3, encrypted Aurora database clusters with BlackByte v3.2, and demanded 5 Bitcoin.

### Exhibit Manifest
1. `01_Incident_Notice_and_Breach_Report.pdf`: CERT-In mandatory incident notification under Section 70B of the IT Act, 2000.
2. `02_telegram_extortion_transcript.txt`: Telegram negotiation between extortion actor `@CipherPhantom_BlackByte` and CISO Arjun Menon with Bitcoin address `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`.
3. `03_cloudtrail_and_auth_logs.csv`: AWS CloudTrail audit logs showing privilege escalation (`IAM:CreateAccessKey`, `S3:GetObject`, `DeleteDBClusterSnapshot`).
4. `04_suspect_laptop_triage_dump.sqlite`: Rogue contractor workstation extraction containing `terminal_history` (`aws s3 sync`, `gpg --symmetric`), `browser_history` (Tor, Mega.nz), and `cloud_credentials`.
5. `05_tampered_salary_slip_evidence.jpg`: Forged employment clearance certificate with spliced authorization seal and GIMP software signature.
6. `06_server_room_raid_photo.jpg`: Server room seizure photo of rogue hardware implant with embedded GPS coordinates (12.9716° N, 77.5946° E — Bengaluru Tech Park, Karnataka) and iPhone 14 Pro camera metadata.