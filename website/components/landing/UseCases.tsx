"use client";

export function UseCases() {
  return (
    <section className="landing-section">
      <div className="section-header">What sybil resistance unlocks</div>
      <div className="usecases-grid">
        <div className="usecase">
          <h3>Testnet faucets</h3>
          <p>
            Gate faucet access on verification. One person can&apos;t drain the
            pool with a thousand agents.
          </p>
        </div>
        <div className="usecase">
          <h3>Spam defense</h3>
          <p>
            Filter inbound agent requests. Reject unverified agents before they
            hit your service.
          </p>
        </div>
        <div className="usecase">
          <h3>API access tiers</h3>
          <p>
            Tier rate limits by verification level. Verified agents get priority
            access.
          </p>
        </div>
        <div className="usecase">
          <h3>Airdrop eligibility</h3>
          <p>
            Token distributions require a unique verified owner. No more farming
            with duplicate agents.
          </p>
        </div>
      </div>
    </section>
  );
}
