"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";
import { identityRegistryAbi, getContracts } from "@/lib/contracts";

interface ApprovalStepProps {
  chainId: number;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function ApprovalStep({
  chainId,
  onComplete,
  onError,
}: ApprovalStepProps) {
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const {
    data: isApproved,
    isLoading: isCheckingApproval,
    refetch,
  } = useReadContract({
    address: contracts?.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "isApprovedForAll",
    args: address && contracts
      ? [address, contracts.bringIdValidator]
      : undefined,
    chainId,
    query: {
      enabled: !!address && !!contracts,
    },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (isApproved) {
      onComplete();
    }
  }, [isApproved, onComplete]);

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (writeError) {
      onError(writeError.message || "Failed to approve validator");
    }
  }, [writeError, onError]);

  const handleApprove = () => {
    if (!contracts) return;
    writeContract({
      address: contracts.identityRegistry,
      abi: identityRegistryAbi,
      functionName: "setApprovalForAll",
      args: [contracts.bringIdValidator, true],
    });
  };

  const isWaiting = isWriting || isConfirming;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Approve Validator</h2>
      <p className="text-gray-400 mb-8">
        The BringID Validator needs approval to record validations for your
        agent.
      </p>

      {isCheckingApproval && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isCheckingApproval && !isApproved && (
        <button
          onClick={handleApprove}
          disabled={isWaiting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWaiting ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {isConfirming ? "Confirming..." : "Approving..."}
            </span>
          ) : (
            "Approve Validator"
          )}
        </button>
      )}

      {isApproved && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400">Validator is approved!</p>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
