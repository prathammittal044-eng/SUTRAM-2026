import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseTrace // SUTRAM 2026 — Universal Digital Forensics & Immutable Evidence Locker",
  description: "AI-augmented Digital Forensics & Incident Response (DFIR) platform and blockchain evidence locker for Law Enforcement, Cyber Crime Cells, and Enterprise Private Investigation Agencies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased bg-black text-white">
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-[#FF4E18] selection:text-white">
        {children}
      </body>
    </html>
  );
}
