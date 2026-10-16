import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface NavInfoModalProps {
  section: string | null;
  onClose: () => void;
  onEnterHaven: () => void;
}

export const NavInfoModal: React.FC<NavInfoModalProps> = ({
  section,
  onClose,
  onEnterHaven,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && section) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, onClose]);

  if (!section) return null;

  const contentMap: Record<
    string,
    { title: string; subtitle: string; body: string[]; action: string }
  > = {
    About: {
      title: 'About CaseTrace',
      subtitle: 'From scattered traces to what really happened.',
      body: [
        'In high-stakes investigations, evidence rarely lives in a single place. It is scattered across deleted messages, cloud audits, geolocation pings, financial ledgers, and fragmented timelines.',
        'CaseTrace connects disparate digital traces into an unbroken, tamper-evident timeline, transforming chaotic breadcrumbs into clear, verifiable truth.',
        'Built for intelligence analysts, cyber forensic investigators, and legal defense teams who need unyielding clarity.',
      ],
      action: 'Begin Investigation',
    },
    Demo: {
      title: 'Investigation Demo',
      subtitle: 'Interactive timeline reconstruction in real time.',
      body: [
        'Experience how CaseTrace parses multi-source evidence—combining endpoint telemetry, encrypted chat extracts, network logs, and cell site records.',
        'Automated entity graph resolution identifies hidden co-occurrences and timeline gaps in seconds.',
        'Explore pre-configured case simulations or test with your own anonymized artifact sets.',
      ],
      action: 'Launch Demo',
    },
    Updates: {
      title: 'Engine & Release Updates',
      subtitle: 'Latest breakthroughs in multi-source timeline intelligence.',
      body: [
        'v3.4 Release: Neural Chronology Engine — Automatic cross-timezone normalization with clock-drift compensation.',
        'Hardware Imager Support: Direct parsing of volatile memory dumps and APFS/ext4 timeline artifacts.',
        'Tamper-Evident Hashing: SHA-3 and BLAKE3 chain verification for court-admissible forensic reporting.',
      ],
      action: 'View All Updates',
    },
    'Contact Us': {
      title: 'Contact CaseTrace',
      subtitle: 'Inquiries for forensic laboratories, intelligence units, and enterprise defense.',
      body: [
        'Speak directly with our senior forensic engineers and systems architects.',
        'Secure communication: contact@casetrace.ai / PGP fingerprint verified on request.',
        'Deploy on-premise in air-gapped facilities or within private sovereign cloud environments.',
      ],
      action: 'Get in Touch',
    },
    'Our Mission': {
      title: 'Our Mission',
      subtitle: 'Eliminating ambiguity in digital investigations through explainable forensics.',
      body: [
        'CaseTrace was founded on a singular conviction: when the stakes are highest, investigators must have total clarity on what truly took place.',
        'We develop explainable intelligence algorithms that piece together fragmented events without black-box conjecture.',
        'Every reconstructed second is anchored in verifiable cryptographic hashes, legal provenance, and empirical telemetry.',
      ],
      action: 'Explore Technology',
    },
    FAQs: {
      title: 'Frequently Asked Questions',
      subtitle: 'Understanding CaseTrace timeline reconstruction & forensic validation.',
      body: [
        'Q: How does CaseTrace handle mismatched timezones and clock drifts? A: Our chronometric engine normalizes NTP skew and hardware offsets automatically.',
        'Q: Can CaseTrace ingest encrypted mobile extracts and cloud logs? A: Yes, we provide native parsers for major forensic UFED/image formats and cloud SaaS telemetry.',
        'Q: Are timelines legally admissible in court? A: Outputs adhere to strict Chain of Custody standards with SHA-256 and BLAKE3 verification logs.',
      ],
      action: 'Request Documentation',
    },
    'Privacy Policy': {
      title: 'Privacy Policy',
      subtitle: 'Strict zero-retention and sovereign forensic isolation.',
      body: [
        'CaseTrace prioritizes confidentiality above all else. Case data and forensic disk images processed locally or in dedicated sovereign clouds are never trained upon or stored without explicit consent.',
        'Zero telemetry retention: evidentiary logs remain strictly encrypted under client-controlled KMS keys.',
        'Compliant with global data privacy frameworks and high-security air-gapped deployment protocols.',
      ],
      action: 'Acknowledge Policy',
    },
    'Terms Of Service': {
      title: 'Terms of Service',
      subtitle: 'Authorized forensic and investigative intelligence usage standards.',
      body: [
        'Access to the CaseTrace platform is restricted to authorized investigative entities, cybersecurity response teams, and accredited forensic analysts.',
        'Users agree to utilize evidentiary outputs in compliance with applicable local and international legal standards.',
        'Unauthorized tampering, reverse engineering of timeline kernels, or non-compliant artifact injection is strictly prohibited.',
      ],
      action: 'Accept Terms',
    },
  };

  const current = contentMap[section] || contentMap.About;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#140C0D] text-white rounded-2xl border border-white/15 p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="font-sans font-bold tracking-widest text-sm text-[#FF6329]">
            CASETRACE
          </span>
          <h3 className="font-editorial text-3xl sm:text-4xl text-white mt-1">
            {current.title}
          </h3>
          <p className="text-sm font-editorial italic text-white/80 mt-1">
            {current.subtitle}
          </p>
        </div>

        <div className="space-y-3 my-6 text-xs sm:text-sm font-sans text-white/70 leading-relaxed border-y border-white/10 py-5">
          {current.body.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-sans text-white/60 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEnterHaven();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#FF4E18] text-white font-sans text-xs font-medium hover:bg-[#FF6735] transition-colors flex items-center gap-2 shadow-lg shadow-[#FF4E18]/20"
          >
            <span>{current.action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
