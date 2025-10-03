import React from 'react';

export default function PenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 21l3.5-.9L20.2 6.4a2.5 2.5 0 10-3.5-3.5L3 16.6V21z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M14 5l5 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

