"use client";

const steps = [
  "Copy the skill to your agent (or visit /verify directly)",
  "Connect wallet, pick credentials, verify through BringID",
  "Humanity score recorded in the EIP-8004 Validation Registry",
];

export function Steps() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-8">How it works</h2>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4 text-sm">
            <span className="font-mono text-accent">{i + 1}.</span>
            <span className="text-neutral-400">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
