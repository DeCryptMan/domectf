'use client';

import { useEffect } from 'react';

export default function Honeypot() {
  // Эта ссылка невидима для человека (opacity 0, position absolute)
  // Но находится в DOM, поэтому сканер ее найдет и попытается проиндексировать
  return (
    <div 
      style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: '1px', width: '1px', overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Ссылка ведет прямо на API бана */}
      <a href="/api/security/ban?reason=HONEYPOT_TRIGGERED" rel="nofollow">
        Admin Panel Debug
      </a>
      <a href="/api/security/ban?reason=SQL_INJECTION_ATTEMPT" rel="nofollow">
        Database Config
      </a>
      <a href="/api/security/ban?reason=DIR_SCANNER" rel="nofollow">
        .env
      </a>
    </div>
  );
}