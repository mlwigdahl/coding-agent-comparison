import React from 'react';

export default function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 3h4l1 2H9l1-2z" stroke="currentColor" strokeWidth="2" />
      <path d="M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

