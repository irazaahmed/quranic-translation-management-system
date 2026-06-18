/**
 * Fixed, full-screen ambient background that lives behind all content.
 * Large blurred color "blobs" drift around in 3D and tiny particles rise
 * upward — pure CSS, always animating, on every device. Decorative only
 * (pointer-events-none, aria-hidden) so it never interferes with the UI.
 */

const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  // Deterministic pseudo-random so server/client markup matches.
  const seed = (i * 9301 + 49297) % 233280;
  const rnd = seed / 233280;
  const rnd2 = ((i * 4099 + 7919) % 233280) / 233280;
  return {
    left: `${Math.round(rnd * 100)}%`,
    size: 4 + Math.round(rnd2 * 8),
    duration: 12 + Math.round(rnd * 16),
    delay: Math.round(rnd2 * 14),
    color: i % 3 === 0 ? "#34d399" : i % 3 === 1 ? "#22d3ee" : "#818cf8",
  };
});

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Drifting aurora blobs */}
      <div
        className="aurora-blob"
        style={{
          top: "-10%",
          left: "-5%",
          width: "42vw",
          height: "42vw",
          background: "radial-gradient(circle, #10b981, transparent 70%)",
          animation: "blobDrift1 22s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: "20%",
          right: "-10%",
          width: "38vw",
          height: "38vw",
          background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          animation: "blobDrift2 28s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: "-15%",
          left: "25%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          animation: "blobDrift3 25s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: "40%",
          left: "10%",
          width: "30vw",
          height: "30vw",
          background: "radial-gradient(circle, #06b6d4, transparent 70%)",
          animation: "blobDrift1 30s ease-in-out infinite reverse",
        }}
      />

      {/* Rising particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
