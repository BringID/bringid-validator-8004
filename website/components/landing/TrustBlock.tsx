"use client";

const details = [
  {
    label: "Multi-credential",
    text: "X, GitHub, Farcaster, Binance KYC, zkPassport -- use what you have.",
  },
  {
    label: "Private",
    text: "MPC-TLS proofs. No personal data on-chain. Only scores and nullifiers.",
  },
  {
    label: "Sybil-resistant",
    text: "One credential = one agent. Proofs cryptographically bound to your agentId.",
  },
];

export function TrustBlock() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-6">
        The details
      </h2>
      <div className="space-y-4">
        {details.map((d) => (
          <p key={d.label} className="text-sm text-neutral-400">
            <span className="text-white font-bold">{d.label}.</span> {d.text}
          </p>
        ))}
      </div>
    </section>
  );
}
