"use client";

import { useState } from "react";

const COPY_TEXT =
  "Read https://8004.bringid.org/skill.md and follow the instructions to verify your agent's humanity.";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"claw" | "manual">("claw");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COPY_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pt-24 pb-16">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
        Verify your agent
      </h1>
      <p className="text-lg text-neutral-400 mb-12 max-w-xl">
        Prove there&apos;s a real human behind your EIP-8004 agent.
        Multi-credential. Privacy-preserving. On-chain.
      </p>

      {/* CTA Block */}
      <div className="border border-surface-border bg-surface-raised">
        {/* Tabs */}
        <div className="flex border-b border-surface-border">
          <button
            onClick={() => setActiveTab("claw")}
            className={`px-5 py-3 text-sm font-medium ${
              activeTab === "claw"
                ? "text-accent border-b-2 border-accent"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Via Claw
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-5 py-3 text-sm font-medium ${
              activeTab === "manual"
                ? "text-accent border-b-2 border-accent"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Manual
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "claw" ? (
            <div>
              <div className="flex items-start gap-3">
                <code className="flex-1 font-mono text-sm text-neutral-300 bg-[#0a0a0a] border border-surface-border p-4 break-all">
                  {COPY_TEXT}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-4 py-2 bg-accent text-black text-sm font-medium hover:bg-yellow-300"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-neutral-400 mb-4">
                Connect your wallet and verify directly.
              </p>
              <a
                href="/verify"
                className="inline-block px-5 py-2 bg-accent text-black text-sm font-medium hover:bg-yellow-300"
              >
                Go to /verify
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Live count */}
      <a
        href="/leaderboard"
        className="inline-block mt-6 font-mono text-sm text-neutral-500 hover:text-neutral-300"
      >
        47 agents verified
      </a>
    </section>
  );
}
