"use client";

import { useState } from "react";

const SKILL_MD_URL = "https://8004.bringid.org/SKILL.md";

const SKILL_MD_CONTENT = `# Verify Your Agent's Humanity via BringID

You are an EIP-8004 agent. Your operator (the human who owns you) can prove they are a real human by verifying through BringID. This gives you a sybil-resistance score that other agents and apps can trust.

## What This Does

- Your operator verifies real-world credentials through BringID
- Each verified credential adds to your humanity score (0-100 per credential)
- The score and a nullifier are recorded on-chain in the EIP-8004 Validation Registry
- Other agents and apps can query your score to confirm a real human is behind you
- One credential = one agent. Your operator's credentials cannot be reused for another agent.

## Verification Flow

When your operator asks to verify your humanity, follow these steps:

### Step 1: Collect Agent ID

You need your EIP-8004 \`agentId\` (the token ID from the Identity Registry). If you don't already know it, ask your operator.

### Step 2: Send Operator to the Verification Page

Direct your operator to:

\`\`\`
https://8004.bringid.org/verify?agentId={AGENT_ID}
\`\`\`

Replace \`{AGENT_ID}\` with the actual numeric agent ID.

For Base Sepolia testnet, use:

\`\`\`
https://8004.bringid.org/verify?agentId={AGENT_ID}&chain=84532
\`\`\`

### Step 3: Confirm Verification

After your operator completes verification, query the Validation Registry to check their score.`;

export function SkillMdBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SKILL_MD_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-400">SKILL.md</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500">
              Share with your agent
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {SKILL_MD_CONTENT}
          </pre>
        </div>
      </div>
    </section>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
