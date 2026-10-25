/** Two glass bubbles over a small sun — the mark used in the top bar and on the upload screen. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <radialGradient id="logo-sun" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffd59a" />
          <stop offset="0.55" stopColor="#f59a3c" />
          <stop offset="1" stopColor="#c9461d" />
        </radialGradient>
        <radialGradient id="logo-glass" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="0.35" stopColor="rgba(160,230,230,0.35)" />
          <stop offset="1" stopColor="rgba(92,200,204,0.15)" />
        </radialGradient>
      </defs>
      <circle cx="14" cy="25" r="11" fill="url(#logo-sun)" />
      <circle cx="25" cy="16" r="11" fill="url(#logo-glass)" stroke="rgba(220,250,250,0.85)" strokeWidth="1.2" />
      <circle cx="31" cy="30" r="5" fill="url(#logo-glass)" stroke="rgba(220,250,250,0.7)" strokeWidth="1" />
    </svg>
  );
}
