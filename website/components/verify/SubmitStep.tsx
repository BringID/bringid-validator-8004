"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";
import { bringIdValidatorAbi, getContracts } from "@/lib/contracts";
import { mapProofsToContract, type SemaphoreProofSDK } from "@/lib/bringid";

interface SubmitStepProps {
  agentId: bigint;
  chainId: number;
  proofs: SemaphoreProofSDK[];
  points: number;
  onComplete: (txHash: string) => void;
  onError: (error: string) => void;
}

export function SubmitStep({
  agentId,
  chainId,
  proofs,
  points,
  onComplete,
  onError,
}: SubmitStepProps) {
  const contracts = getContracts(chainId);

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed && txHash) {
      onComplete(txHash);
    }
  }, [isConfirmed, txHash, onComplete]);

  useEffect(() => {
    if (writeError) {
      // Parse common errors
      const msg = writeError.message || "";
      if (msg.includes("NullifierAlreadyUsed") || msg.includes("already")) {
        onError("One or more credentials have already been used for another agent.");
      } else if (msg.includes("InvalidProof") || msg.includes("proof")) {
        onError("Proof verification failed. Please try verifying again.");
      } else if (msg.includes("NotApproved") || msg.includes("approved")) {
        onError("Validator not approved. Please go back and approve.");
      } else {
        onError(msg || "Transaction failed");
      }
    }
    if (confirmError) {
      onError(confirmError.message || "Transaction confirmation failed");
    }
  }, [writeError, confirmError, onError]);

  const handleSubmit = () => {
    if (!contracts) return;

    const contractProofs = mapProofsToContract(proofs);

    if (contractProofs.length === 1) {
      writeContract({
        address: contracts.bringIdValidator,
        abi: bringIdValidatorAbi,
        functionName: "validate",
        args: [agentId, contractProofs[0]],
      });
    } else {
      writeContract({
        address: contracts.bringIdValidator,
        abi: bringIdValidatorAbi,
        functionName: "validateBatch",
        args: [agentId, contractProofs],
      });
    }
  };

  const isWaiting = isWriting || isConfirming;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Submit Proofs On-Chain</h2>
      <p className="text-gray-400 mb-6">
        Submit your verified credentials to the blockchain.
      </p>

      <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-lg font-semibold text-white mb-2">
          {proofs.length} Credential{proofs.length !== 1 ? "s" : ""} Verified
        </div>
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {points} Points
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isWaiting}
        className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWaiting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            {isConfirming ? "Confirming..." : "Submitting..."}
          </span>
        ) : (
          "Submit to Blockchain"
        )}
      </button>

      {txHash && !isConfirmed && (
        <p className="mt-4 text-sm text-gray-500">
          Transaction submitted. Waiting for confirmation...
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
