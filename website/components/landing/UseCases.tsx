"use client";

export function UseCases() {
  return (
    <section className="landing-section">
      <div className="section-header">What humanity verification unlocks</div>
      <div className="usecases-grid">
        <div className="usecase">
          <h3>Testnet faucets</h3>
          <p>
            Gate faucet access on humanity scores. No more sybil-drained
            testnets.
          </p>
        </div>
        <div className="usecase">
          <h3>Spam defense</h3>
          <p>
            Filter inbound agent requests. Only engage with human-backed agents.
          </p>
        </div>
        <div className="usecase">
          <h3>API access tiers</h3>
          <p>
            Tier rate limits by verification level. Verified owners get priority.
          </p>
        </div>
        <div className="usecase">
          <h3>Airdrop eligibility</h3>
          <p>
            Token distributions and gated access can require a humanity score.
          </p>
        </div>
      </div>
    </section>
  );
}
