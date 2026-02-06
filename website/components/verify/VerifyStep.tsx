"use client";

import { useState, useEffect, useRef } from "react";
import { encodeAbiParameters, keccak256 } from "viem";
import { BringID } from "bringid";
import type { SemaphoreProofSDK } from "@/lib/bringid";
import { getContracts } from "@/lib/contracts";

interface VerifyStepProps {
  agentId: bigint;
  chainId: number;
  onComplete: (proofs: SemaphoreProofSDK[], points: number) => void;
  onError: (error: string) => void;
}

export function VerifyStep({ agentId, chainId, onComplete, onError }: VerifyStepProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const bringIdRef = useRef<BringID | null>(null);

  // Use dev mode for Base Sepolia (testnet)
  const isTestnet = chainId === 84532;

  // Get validator contract address for this chain
  const contracts = getContracts(chainId);

  // Calculate scope: keccak256(abi.encode(validatorAddress, context)) where context=0
  // The CredentialRegistry checks scope against msg.sender (the validator contract)
  const scope = contracts
    ? BigInt(
        keccak256(
          encodeAbiParameters(
            [{ type: "address" }, { type: "uint256" }],
            [contracts.bringIdValidator, BigInt(0)]
          )
        )
      ).toString()
    : null;

  useEffect(() => {
    // Initialize BringID SDK with dev mode for testnet
    bringIdRef.current = new BringID({ mode: isTestnet ? "dev" : undefined });
    setIsReady(true);

    return () => {
      bringIdRef.current?.destroy();
    };
  }, [isTestnet]);

  const handleVerify = async () => {
    if (!bringIdRef.current || !scope) return;

    setIsVerifying(true);
    try {
      const result = await bringIdRef.current.verifyHumanity({
        message: agentId.toString(),
        scope: scope,
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
      <p className="text-neutral-400 mb-8">
        Click the button below to open BringID and verify your credentials.
        Each credential adds to your humanity score.
      </p>

      <button
        onClick={handleVerify}
        disabled={isVerifying || !isReady || !scope}
        className="px-6 py-3 bg-accent text-black font-medium hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Waiting for BringID...
          </span>
        ) : !isReady || !scope ? (
          "Loading..."
        ) : (
          "Open BringID"
        )}
      </button>

      <p className="mt-6 text-sm text-neutral-500">
        Available credentials: X, GitHub, Farcaster, Binance KYC, Apple,
        zkPassport, Self
      </p>

      {isVerifying && (
        <p className="mt-4 text-sm text-neutral-400">
          Complete verification in the BringID modal and return here.
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
  );
}
