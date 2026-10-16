'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">
      Redirecting to CaseTrace Forensic OS...
    </div>
  );
}
