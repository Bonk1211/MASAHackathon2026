import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function detectInstallable(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

export function QRInstall() {
  const [where, setWhere] = useState<'ios' | 'android' | 'desktop'>('desktop');
  useEffect(() => { setWhere(detectInstallable()); }, []);

  const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://r-ignite.vercel.app';

  return (
    <section className="grid grid-cols-[auto_1fr] gap-4 border border-rule bg-paper px-5 py-5">
      <div className="grid h-[112px] w-[112px] place-items-center border border-rule bg-paper p-2">
        <QRCodeSVG
          value={url}
          size={96}
          level="M"
          fgColor="#0A1A2A"
          bgColor="transparent"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <p className="eyebrow text-muted">Take it with you</p>
          <h3 className="display mt-1 text-[22px] leading-[1.05] text-ink">
            Install <span className="italic">R·Ignite</span>
          </h3>
          <p className="mt-1.5 text-[12px] leading-snug text-muted">
            {where === 'desktop'
              ? 'Scan with your phone camera. Open in Safari or Chrome → Add to Home Screen.'
              : where === 'ios'
              ? 'Tap the share icon, then Add to Home Screen.'
              : 'Tap the menu, then Install app or Add to Home Screen.'}
          </p>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          Offline-capable PWA · 0 server calls
        </p>
      </div>
    </section>
  );
}
