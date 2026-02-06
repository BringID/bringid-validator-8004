"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, Suspense } from "react";
import type { SemaphoreProofSDK } from "@/lib/bringid";
import { Nav } from "@/components/landing/Nav";
import { VerifyStepper } from "@/components/verify/VerifyStepper";
import { ConnectStep } from "@/components/verify/ConnectStep";
import { OwnershipStep } from "@/components/verify/OwnershipStep";
import { ApprovalStep } from "@/components/verify/ApprovalStep";
import { VerifyStep } from "@/components/verify/VerifyStep";
import { SubmitStep } from "@/components/verify/SubmitStep";
import { SuccessStep } from "@/components/verify/SuccessStep";

function VerifyContent() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get("agentId");
  const chainParam = searchParams.get("chain");

  const agentId = agentIdParam ? BigInt(agentIdParam) : null;
  const chainId = chainParam ? parseInt(chainParam) : 8453; // Default to Base Mainnet

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [proofs, setProofs] = useState<SemaphoreProofSDK[]>([]);
  const [points, setPoints] = useState(0);
  const [txHash, setTxHash] = useState<string>("");

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const clearError = () => setError(null);

  if (!agentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-raised border border-red-500/30 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Missing Agent ID
          </h1>
          <p className="text-neutral-400 mb-6">
            Please provide an agent ID in the URL.
          </p>
          <code className="block p-3 bg-[#0a0a0a] border border-surface-border font-mono text-sm text-neutral-300">
            /verify?agentId=123
          </code>
        </div>
      </div>
    );
  }

  // Validate chain ID
  if (chainId !== 8453 && chainId !== 84532) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-raised border border-red-500/30 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Invalid Chain
          </h1>
          <p className="text-neutral-400 mb-6">
            Only Base Mainnet (8453) and Base Sepolia (84532) are supported.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-16">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Verify Agent #{agentId.toString()}
          </h1>
          <p className="text-neutral-500 text-sm font-mono">
            {chainId === 84532 ? "Base Sepolia Testnet" : "Base Mainnet"}
          </p>
        </header>

        <VerifyStepper currentStep={step} />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={clearError}
              className="text-sm text-red-400 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-surface-raised border border-surface-border p-8">
          {step === 1 && (
            <ConnectStep
              targetChainId={chainId}
              onComplete={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <OwnershipStep
              agentId={agentId}
              chainId={chainId}
              onComplete={() => setStep(3)}
              onError={handleError}
            />
          )}

          {step === 3 && (
            <ApprovalStep
              chainId={chainId}
              onComplete={() => setStep(4)}
              onError={handleError}
            />
          )}

          {step === 4 && (
            <VerifyStep
              agentId={agentId}
              chainId={chainId}
              onComplete={(newProofs, newPoints) => {
                setProofs(newProofs);
                setPoints(newPoints);
                setStep(5);
              }}
              onError={handleError}
            />
          )}

          {step === 5 && (
            <SubmitStep
              agentId={agentId}
              chainId={chainId}
              proofs={proofs}
              points={points}
              onComplete={(hash) => {
                setTxHash(hash);
                setStep(6);
              }}
              onError={handleError}
            />
          )}

          {step === 6 && (
            <SuccessStep
              agentId={agentId}
              chainId={chainId}
              txHash={txHash}
              points={points}
            />
          )}
        </div>

        <footer className="text-center mt-8 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-neutral-300">
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
