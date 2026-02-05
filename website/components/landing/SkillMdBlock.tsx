"use client";

import { useState } from "react";

const COPY_TEXT = "Read https://8004.bringid.org/SKILL.md and follow the instructions to verify your humanity.";

export function SkillMdBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COPY_TEXT);
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
          <a
            href="/SKILL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View full file
          </a>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Copy the text below and paste it to your agent to enable humanity verification:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200">
            {COPY_TEXT}
          </div>
          <button
            onClick={handleCopy}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors text-white font-medium"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>
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
