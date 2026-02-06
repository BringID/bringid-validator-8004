"use client";

import { getBlockExplorerUrl } from "@/lib/chains";

interface SuccessStepProps {
  agentId: bigint;
  chainId: number;
  txHash: string;
  points: number;
}

export function SuccessStep({
  agentId,
  chainId,
  txHash,
  points,
}: SuccessStepProps) {
  const explorerUrl = getBlockExplorerUrl(chainId, txHash);

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-accent flex items-center justify-center">
        <CheckIcon className="w-8 h-8 text-black" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Verification Complete</h2>
      <p className="text-neutral-400 mb-8">
        Your agent&apos;s humanity has been verified on-chain.
      </p>

      <div className="mb-8 p-6 bg-[#0a0a0a] border border-surface-border">
        <div className="text-sm text-neutral-500 font-mono mb-1">Agent #{agentId.toString()}</div>
        <div className="text-4xl font-bold font-mono text-accent">
          {points} Points
        </div>
        <div className="text-sm text-neutral-500 mt-2">Humanity Score</div>
      </div>

      <div className="space-y-4">
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-surface-raised border border-surface-border text-white font-medium hover:border-neutral-500"
          >
            View Transaction
          </a>
        )}

        <button
          onClick={() => window.close()}
          className="block w-full px-6 py-3 border border-surface-border text-neutral-400 font-medium hover:border-neutral-500 hover:text-white"
        >
          Close & Return to Agent
        </button>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Your agent can now query the Validation Registry to confirm your score.
      </p>
    </div>
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
