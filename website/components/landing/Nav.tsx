"use client";

export function Nav() {
  return (
    <nav className="landing-nav">
      <div className="nav-left">
        <img
          src="/logo.png"
          alt="BringID"
        />
        <span>BRINGID &times; 8004</span>
      </div>
      <div className="nav-right">
        <a href="/leaderboard">Leaderboard</a>
      </div>
    </nav>
  );
}
