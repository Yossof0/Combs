import { Globe, Youtube, Facebook, Twitter } from 'lucide-react';

const socials = [
  {
    label: 'Website',
    href: 'https://yossof0.github.io',
    icon: <Globe size={15} />,
    color: '#0ea5e9',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/YossofABD',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    color: '#1877f2',
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/@Overclock33',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: '#1da1f2',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@OverClock33',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
      </svg>
    ),
    color: '#ff0000',
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: `${s.color}18`,
                border: `1px solid ${s.color}40`,
                color: s.color,
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>
        <p className="text-xs font-mono text-center" style={{ color: 'var(--text-muted)' }}>
          Made by{' '}
          <a
            href="https://yossof0.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: 'var(--brand)' }}
          >
            Yossof0
          </a>
          {' '}· WordComb Calculator
        </p>
      </div>
    </footer>
  );
}
