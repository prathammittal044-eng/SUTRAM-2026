import React, { useState } from 'react';

interface InvestigatorPhoneArtworkProps {
  className?: string;
}

export const InvestigatorPhoneArtwork: React.FC<InvestigatorPhoneArtworkProps> = ({
  className = '',
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative w-full h-full bg-[#0a0a0a] overflow-hidden select-none ${className}`}
    >
      <img
        src="https://i.pinimg.com/736x/f0/cb/d8/f0cbd8a4ddba4dceef97db5b151be591.jpg"
        alt="Investigation agent on telephone"
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-90'
        }`}
        loading="eager"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};
