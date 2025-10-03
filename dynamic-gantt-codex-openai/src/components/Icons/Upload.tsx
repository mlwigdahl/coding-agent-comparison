import React from 'react';

export default function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 13l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

