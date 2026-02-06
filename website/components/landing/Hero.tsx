"use client";

export function Hero() {
  return (
    <section className="hero">
      <h1>
        Sybil resistance for the <span className="accent">agentic web.</span>
        <br />
        <span className="hero-qualifier">Powered by BringID. Native to EIP-8004.</span>
      </h1>
      <p className="subtitle">
        One attacker can spin up a thousand agents, drain your faucet, flood
        your API, and game your reputation system. BringID enforces one
        credential per agent — on-chain, private, unforgeable.
      </p>
    </section>
  );
}
