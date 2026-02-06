"use client";

export function Illustration() {
  return (
    <section className="illustration-section">
      <div className="illustration-grid">
        {/* Without verification */}
        <div className="scenario scenario-a">
          <div className="scenario-label">
            <span className="dot" />
            Without verification
          </div>
          <div className="diagram">
            <div className="diagram-row">
              <div className="entity">
                <div
                  className="entity-icon"
                  style={{ borderColor: "#ff4444" }}
                >
                  &#x1D5D0;
                </div>
                <div className="entity-label" style={{ color: "#ff4444" }}>
                  attacker
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flexGrow: 1,
                }}
              >
                <div className="arrow arrow-flood" />
                <div className="arrow arrow-flood" />
                <div className="arrow arrow-flood" />
              </div>
              <div className="bots-cluster">
                <div className="bot-row">
                  <div className="bot-icon evil">b</div>
                  <div className="bot-icon evil">b</div>
                  <div className="bot-icon evil">b</div>
                </div>
                <div className="bot-row">
                  <div className="bot-icon evil">b</div>
                  <div className="bot-icon evil">b</div>
                  <div className="bot-icon evil">b</div>
                </div>
              </div>
              <div className="arrow arrow-flood" />
              <div
                className="service-box"
                style={{ borderColor: "#ff4444", color: "#ff4444" }}
              >
                SERVICE
                <br />
                <span style={{ fontSize: "10px", opacity: 0.6 }}>
                  overloaded
                </span>
              </div>
            </div>
            <div className="flood-indicator">
              &#x25B2; 6 bots flooding requests
            </div>
            <div className="diagram-row">
              <div className="entity">
                <div className="entity-icon">&#x1D5D0;</div>
                <div className="entity-label">human</div>
              </div>
              <div className="arrow arrow-blocked" />
              <div className="bots-cluster">
                <div className="bot-row">
                  <div
                    className="bot-icon"
                    style={{ opacity: 0.3, borderStyle: "dashed" }}
                  >
                    b
                  </div>
                </div>
              </div>
              <div className="arrow arrow-blocked" />
              <div
                className="service-box"
                style={{ borderColor: "#333", color: "#555" }}
              >
                <span style={{ fontSize: "18px" }}>&#x2715;</span>
                <br />
                <span style={{ fontSize: "10px" }}>denied</span>
              </div>
            </div>
            <div className="starved">
              &#x25BC; legitimate agent starved of resources
            </div>
          </div>
          <p className="scenario-caption">
            <strong>One attacker, six bots.</strong> The service can&apos;t tell
            who&apos;s real. Legitimate agents get crowded out.
          </p>
        </div>

        {/* With BringID verification */}
        <div className="scenario scenario-b">
          <div className="scenario-label">
            <span className="dot" />
            With BringID verification
          </div>
          <div className="diagram">
            <div className="diagram-row">
              <div className="entity">
                <div
                  className="entity-icon"
                  style={{ borderColor: "var(--fg-dim)" }}
                >
                  &#x1D5D0;
                </div>
                <div className="entity-label">attacker</div>
              </div>
              <div className="arrow arrow-good" />
              <div className="shield">1:1</div>
              <div className="arrow arrow-verified" />
              <div className="bots-cluster">
                <div className="bot-row">
                  <div className="bot-icon verified">b</div>
                  <div className="bot-icon blocked">b</div>
                  <div className="bot-icon blocked">b</div>
                </div>
              </div>
              <div className="arrow arrow-verified" />
              <div
                className="service-box"
                style={{
                  borderColor: "var(--yellow)",
                  color: "var(--yellow)",
                }}
              >
                SERVICE
                <br />
                <span style={{ fontSize: "10px", opacity: 0.6 }}>
                  1 share
                </span>
              </div>
            </div>
            <div className="check">
              &#x25B2; 1 credential = 1 agent. 5 bots rejected.
            </div>
            <div className="diagram-row">
              <div className="entity">
                <div
                  className="entity-icon"
                  style={{ borderColor: "var(--yellow)" }}
                >
                  &#x1D5D0;
                </div>
                <div className="entity-label" style={{ color: "var(--yellow)" }}>
                  human
                </div>
              </div>
              <div className="arrow arrow-verified" />
              <div className="shield">1:1</div>
              <div className="arrow arrow-verified" />
              <div className="bots-cluster">
                <div className="bot-row">
                  <div className="bot-icon verified">b</div>
                </div>
              </div>
              <div className="arrow arrow-verified" />
              <div
                className="service-box"
                style={{
                  borderColor: "var(--yellow)",
                  color: "var(--yellow)",
                }}
              >
                SERVICE
                <br />
                <span style={{ fontSize: "10px", opacity: 0.6 }}>
                  1 share
                </span>
              </div>
            </div>
            <div className="fair-share">
              &#x25BC; fair access. each human gets equal share.
            </div>
          </div>
          <p className="scenario-caption">
            <strong>One credential per agent.</strong> Attackers can&apos;t
            multiply. Every human-backed agent gets fair access.
          </p>
        </div>
      </div>
    </section>
  );
}
