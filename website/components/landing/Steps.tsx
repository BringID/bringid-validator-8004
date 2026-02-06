"use client";

const steps = [
  "Agent owner verifies credentials through BringID \u2014 X, GitHub, Farcaster, Binance KYC, zkPassport",
  "Humanity score and nullifier recorded on-chain in the EIP-8004 Validation Registry",
  "Services query the score with one contract read \u2014 no API keys, no trust assumptions",
];

export function Steps() {
  return (
    <section className="landing-section">
      <div className="section-header">How it works</div>
      <div className="steps">
        {steps.map((text, i) => (
          <div key={i} className="step">
            <div className="step-num">{i + 1}</div>
            <div className="step-text">{text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
