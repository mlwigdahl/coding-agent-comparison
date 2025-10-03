import React from 'react';

export default function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M2 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M14 20a5 5 0 015-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

