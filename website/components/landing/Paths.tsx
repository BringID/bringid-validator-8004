"use client";

import { useState } from "react";

const COPY_TEXT =
  "Read https://8004.bringid.org/skill.md and follow the instructions to verify your agent's humanity.";

export function Paths() {
  const [activeTab, setActiveTab] = useState<"claw" | "manual">("claw");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COPY_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="paths-section">
      <div className="paths-grid">
        {/* Services path */}
        <div className="path-card">
          <div className="path-label">For services &amp; protocols</div>
          <div className="path-title">Gate on humanity</div>
          <p className="path-desc">
            Check if an agent has a verified human owner before granting access.
            One contract read from the EIP-8004 Validation Registry.
          </p>
          <div className="code-block">
            <span className="cm">{"// check agent's humanity score"}</span>
            {"\n"}
            <span className="kw">const</span>
            {" { totalScore } = "}
            <span className="kw">await</span>
            {" validator."}
            <span className="fn">getAgentScore</span>
            {"(\n  BigInt(agentId)\n);\n\n"}
            <span className="kw">if</span>
            {" (totalScore > "}
            <span className="str">0</span>
            {") {\n  "}
            <span className="cm">{"// human-backed agent \u2714"}</span>
            {"\n}"}
          </div>
          <div className="path-links">
            <a
              href="https://www.npmjs.com/package/@bringid/validator8004"
              target="_blank"
              rel="noopener noreferrer"
              className="path-link"
            >
              <span>npm</span> @bringid/validator8004
            </a>
            <a
              href="https://github.com/BringID/bringid-validator-8004"
              target="_blank"
              rel="noopener noreferrer"
              className="path-link"
            >
              <span>github</span> BringID/bringid-validator-8004
            </a>
            <a
              href="https://github.com/BringID/bringid-validator-8004/blob/main/docs/SPEC.md"
              target="_blank"
              rel="noopener noreferrer"
              className="path-link"
            >
              <span>spec</span> Integration docs
            </a>
          </div>
        </div>

        {/* Agent owners path */}
        <div className="path-card">
          <div className="path-label">For agent owners</div>
          <div className="path-title">Verify your agent</div>
          <p className="path-desc">
            Prove there&apos;s a real human behind your EIP-8004 agent. Services
            are starting to gate on humanity scores — verify now or get filtered
            out.
          </p>
          <div className="path-tabs">
            <button
              className={`path-tab${activeTab === "claw" ? " active" : ""}`}
              onClick={() => setActiveTab("claw")}
            >
              Via Claw
            </button>
            <button
              className={`path-tab${activeTab === "manual" ? " active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              Manual
            </button>
          </div>
          {activeTab === "claw" && (
            <div className="copy-block">
              <code>{COPY_TEXT}</code>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
          {activeTab === "manual" && (
            <p className="manual-text">
              Connect your wallet and verify directly at{" "}
              <a href="/verify">8004.bringid.org/verify</a>
            </p>
          )}
          <div className="verified-count">
            <a href="/leaderboard">
              <span className="num">47</span> agents verified
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
