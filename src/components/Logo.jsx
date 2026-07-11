import React from 'react';

export default function Logo({ size = 56, strokeColor, ...props }) {
  // Se strokeColor for passado, usa ele. Caso contrário, usa o gradiente padrão da marca.
  const strokeValue = strokeColor || 'url(#logo-gradient)';
  const fillValue = strokeColor || 'url(#logo-gradient)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeValue}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
          <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
        </linearGradient>
      </defs>

      {/* Prancheta / Suporte */}
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      {/* Presilha da prancheta */}
      <rect x="9" y="2" width="6" height="3" rx="1" fill={fillValue} stroke="none" />

      {/* Item 1 da lista: Checkmark + Convidado */}
      <path d="M7 10l1.5 1.5 2.5-2.5" />
      <circle cx="15.5" cy="9.5" r="1.2" fill={fillValue} stroke="none" />
      <path d="M13.5 13c0-.8.5-1.2 1-1.2h2c.5 0 1 .4 1 1.2" />

      {/* Item 2 da lista: Checkmark + Convidado */}
      <path d="M7 16l1.5 1.5 2.5-2.5" />
      <circle cx="15.5" cy="15.5" r="1.2" fill={fillValue} stroke="none" />
      <path d="M13.5 19c0-.8.5-1.2 1-1.2h2c.5 0 1 .4 1 1.2" />
    </svg>
  );
}
