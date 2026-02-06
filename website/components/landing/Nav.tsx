"use client";

export function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="BringID"
          className="w-8 h-8"
          style={{ imageRendering: "pixelated" }}
        />
        <span className="font-mono text-sm tracking-wide text-neutral-400">
          BringID <span className="text-accent">x</span> 8004
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="/leaderboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          Leaderboard
        </a>
        <a
          href="/developers"
          className="text-sm text-neutral-400 hover:text-white"
        >
          Developers
        </a>
      </div>
    </nav>
  );
}
