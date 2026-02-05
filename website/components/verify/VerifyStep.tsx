"use client";

import { useState, useEffect, useRef } from "react";
import { BringID } from "bringid";
import type { SemaphoreProofSDK } from "@/lib/bringid";

interface VerifyStepProps {
  agentId: bigint;
  onComplete: (proofs: SemaphoreProofSDK[], points: number) => void;
  onError: (error: string) => void;
}

export function VerifyStep({ agentId, onComplete, onError }: VerifyStepProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const bringIdRef = useRef<BringID | null>(null);

  useEffect(() => {
    // Initialize BringID instance
    bringIdRef.current = new BringID();

    return () => {
      // Cleanup
      bringIdRef.current?.destroy();
    };
  }, []);

  const handleVerify = async () => {
    if (!bringIdRef.current) return;

    setIsVerifying(true);
    try {
      const result = await bringIdRef.current.verifyHumanity({
        scope: agentId.toString(),
      });

      if (result.proofs.length === 0) {
        onError("No credentials were verified. Please try again.");
        return;
      }

      onComplete(result.proofs as SemaphoreProofSDK[], result.points);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Verify Your Humanity</h2>
      <p className="text-gray-400 mb-8">
        Open the BringID modal to verify your credentials. Each credential adds
        to your humanity score.
      </p>

      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Verifying...
          </span>
        ) : (
          "Open BringID"
        )}
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Available credentials: X, GitHub, Farcaster, Binance KYC, Apple,
        zkPassport, Self
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
