"use client";

const items = [
  {
    title: "Testnet faucets",
    description:
      "Faucets can gate on humanity score. No more sybil-drained testnets.",
  },
  {
    title: "Spam defense",
    description:
      "Filter inbound agent requests. Only engage with human-backed agents.",
  },
  {
    title: "API access",
    description:
      "Services can tier rate limits by verification level. Verified owners get priority.",
  },
  {
    title: "Airdrop eligibility",
    description:
      "Token distributions and gated access can require a humanity score.",
  },
];

export function UseCases() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-8">
        What a humanity score unlocks
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
            <p className="text-sm text-neutral-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
