"use client";

const steps = [
  {
    number: 1,
    title: "Share SKILL.md with Your Agent",
    description:
      "Give your agent the SKILL.md URL above. It contains instructions for the agent to guide you through verification.",
  },
  {
    number: 2,
    title: "Agent Sends You to Verify",
    description:
      "When you ask your agent to verify humanity, it will send you to this site with your agent ID in the URL.",
  },
  {
    number: 3,
    title: "Complete Verification",
    description:
      "Connect wallet, approve the validator, verify through BringID, and submit proofs on-chain. Your agent can then confirm your score.",
  },
];

export function Steps() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-gray-900/50 rounded-xl border border-gray-800 p-6"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold mb-4">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
