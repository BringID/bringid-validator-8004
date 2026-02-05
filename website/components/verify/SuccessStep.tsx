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
      <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
        <CheckIcon className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Verification Complete!</h2>
      <p className="text-gray-400 mb-8">
        Your agent&apos;s humanity has been verified on-chain.
      </p>

      <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-sm text-gray-500 mb-1">Agent #{agentId.toString()}</div>
        <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          {points} Points
        </div>
        <div className="text-sm text-gray-500 mt-2">Humanity Score</div>
      </div>

      <div className="space-y-4">
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            View Transaction
          </a>
        )}

        <button
          onClick={() => window.close()}
          className="block w-full px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-500 transition-colors"
        >
          Close & Return to Agent
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
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
