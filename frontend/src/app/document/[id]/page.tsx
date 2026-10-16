'use client';

import { useParams, useRouter } from 'next/navigation';
import { FileLock2, AlertTriangle, X, UploadCloud, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DocumentUpdate() {
  const { id } = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('sih_user_id');
    if (storedId) setCurrentUserId(parseInt(storedId));
  }, []);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (isUploading) return;
    setIsUploading(true);
    const formData = new FormData(e.target);
    formData.append('user_id', currentUserId.toString());

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${id}/versions/`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Document version created securely and hash anchored!');
        router.back();
      } else {
        const err = await res.json().catch(() => null);
        const msg = err?.detail || `Server error: ${res.status}`;
        alert(`Failed to update document.\n\n${msg}`);
      }
    } catch (err) {
      alert('Error updating document version.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white/[0.03] p-8 rounded-lg shadow-2xl border border-white/10 max-w-lg w-full relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF5A1F] to-white/40"></div>
        
        <div className="flex justify-between items-start mb-6 pt-2">
          <div>
            <h2 className="text-2xl font-normal font-editorial text-white flex items-center gap-2">
              <FileLock2 className="w-5 h-5 text-[#FF5A1F]" /> Append Version Iteration
            </h2>
            <p className="text-xs font-mono text-white/50 mt-1">Generating new immutable version for Exhibit #{id}</p>
          </div>
          <button 
            onClick={() => router.back()} 
            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded mb-6 flex gap-3 text-xs font-mono text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-1 text-amber-300 uppercase tracking-wide text-[11px]">Strict Non-Destructive Versioning</strong>
            Previous version will be flagged as <span className="bg-amber-950/80 px-1 py-0.5 rounded border border-amber-500/40 text-amber-200">SUPERSEDED</span>. All historical cryptographic hashes remain on-chain indefinitely to preserve legal admissibility under BSA Section 63.
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5 font-mono">
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Select Updated Exhibit Payload</label>
            <div className="border border-dashed border-white/20 rounded p-6 bg-white/[0.02] hover:border-white/50 transition-colors text-center cursor-pointer">
              <input 
                required 
                name="file" 
                type="file" 
                className="w-full text-xs text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:font-bold file:bg-white file:text-black hover:file:bg-stone-200 cursor-pointer" 
              />
            </div>
          </div>
          
          <button 
            disabled={isUploading} 
            type="submit" 
            className={`w-full ${isUploading ? 'bg-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-stone-200 cursor-pointer'} py-3 rounded text-xs font-bold tracking-widest uppercase shadow-lg transition-all flex justify-center items-center gap-2`}
          >
            {isUploading ? (
              <>
                <RefreshCw className="animate-spin w-4 h-4" />
                Computing Hash & Ingesting...
              </>
            ) : (
              <>
                <FileLock2 className="w-4 h-4" /> Seal Version & Anchor
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
