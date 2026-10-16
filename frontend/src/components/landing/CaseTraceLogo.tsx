import React from 'react';

interface CaseTraceLogoProps {
  className?: string;
  size?: number;
}

export const CaseTraceLogo: React.FC<CaseTraceLogoProps> = ({
  className = 'w-6 h-6',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* 
        CaseTrace Emblem:
        Octagon-chamfered 'C' containing an embedded 't' and forensic digital footprints
      */}
      {/* Outer Octagonal C with opening on the right */}
      <path
        d="M 28 0 
           L 72 0 
           L 100 28 
           L 72 28 
           L 58 28
           C 54 28 50 32 50 36
           L 50 36
           L 100 36
           L 100 64
           L 50 64
           L 50 64
           C 50 68 54 72 58 72
           L 72 72
           L 100 72
           L 72 100 
           L 28 100 
           L 0 72 
           L 0 28 
           Z"
        fill="currentColor"
        fillRule="evenodd"
        style={{ display: 'none' }}
      />

      {/* Clean high-fidelity vector representation of the exact logo in g (1).png */}
      <g fill="currentColor">
        {/* Main C body with internal chamber */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 26 0 
             L 74 0 
             L 100 26 
             L 100 37 
             L 60 37 
             L 60 30 
             L 45 30 
             L 38 37 
             L 38 63 
             L 45 70 
             L 60 70 
             L 60 63 
             L 100 63 
             L 100 74 
             L 74 100 
             L 26 100 
             L 0 74 
             L 0 26 
             Z"
        />

        {/* The 't' glyph inside the inner chamber */}
        {/* Stem and crossbar of 't' */}
        <path
          d="M 46 36 L 54 36 L 54 44 L 60 44 L 60 50 L 54 50 L 54 62 C 54 64 55 65 57 65 L 60 65 L 60 70 L 55 70 C 50 70 47 67 47 62 L 47 50 L 41 50 L 41 44 L 46 44 Z"
        />

        {/* 3 Forensic Footprints in the portal opening */}
        {/* Footprint 1: Top right angled step */}
        <g transform="translate(86, 42) rotate(45)">
          {/* Sole */}
          <path d="M -3 -8 C -4 -4 -4 0 -3 4 C -1 5 1 5 3 4 C 4 0 4 -4 3 -8 C 2 -10 -2 -10 -3 -8 Z" />
          {/* Heel */}
          <path d="M -2.5 6 C -3 8 -3 10 -2.5 11 C -1 12 1 12 2.5 11 C 3 10 3 8 2.5 6 Z" />
        </g>

        {/* Footprint 2: Middle vertical step */}
        <g transform="translate(68, 51)">
          {/* Sole */}
          <path d="M -3 -7 C -4 -3 -4 0 -3 3 C -1 4 1 4 3 3 C 4 0 4 -3 3 -7 C 2 -9 -2 -9 -3 -7 Z" />
          {/* Heel */}
          <path d="M -2.5 5 C -3 7 -3 8.5 -2.5 9.5 C -1 10.5 1 10.5 2.5 9.5 C 3 8.5 3 7 2.5 5 Z" />
        </g>

        {/* Footprint 3: Bottom right step */}
        <g transform="translate(83, 58)">
          {/* Sole */}
          <path d="M -3 -7 C -4 -3 -4 0 -3 3 C -1 4 1 4 3 3 C 4 0 4 -3 3 -7 C 2 -9 -2 -9 -3 -7 Z" />
          {/* Heel */}
          <path d="M -2.5 5 C -3 7 -3 8.5 -2.5 9.5 C -1 10.5 1 10.5 2.5 9.5 C 3 8.5 3 7 2.5 5 Z" />
        </g>
      </g>
    </svg>
  );
};
