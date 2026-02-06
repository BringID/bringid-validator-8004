"use client";

const details = [
  {
    title: "Multi-credential",
    desc: "X, GitHub, Farcaster, Binance KYC, zkPassport \u2014 each adds to the score. More credentials = harder to fake.",
  },
  {
    title: "1:1 binding",
    desc: "One credential = one agent. Proofs cryptographically bound to agentId. Can\u2019t be reused, split, or frontrun.",
  },
  {
    title: "Private",
    desc: "MPC-TLS proofs. No personal data on-chain. Only scores and nullifiers. The service knows you\u2019re unique \u2014 not who you are.",
  },
  {
    title: "Native EIP-8004",
    desc: "Lives in the Validation Registry. No sidecars, no extra infra. Query it like any other validation.",
  },
];

export function TrustBlock() {
  return (
    <section className="landing-section">
      <div className="section-header">The details</div>
      <div className="details-list">
        {details.map((d) => (
          <div key={d.title} className="detail">
            <div className="detail-title">{d.title}</div>
            <div className="detail-desc">{d.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
