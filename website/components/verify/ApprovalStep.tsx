"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";
import { identityRegistryAbi, getContracts } from "@/lib/contracts";
import { getBlockExplorerUrl } from "@/lib/chains";

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
  const explorerUrl = txHash ? getBlockExplorerUrl(chainId, txHash) : null;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Approve Validator</h2>
      <p className="text-gray-400 mb-8">
        The BringID Validator needs approval to record validations for your
        agent.
      </p>

      {isCheckingApproval && (
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-gray-500 text-sm">Checking approval status...</p>
        </div>
      )}

      {!isCheckingApproval && !isApproved && !isWaiting && (
        <button
          onClick={handleApprove}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors"
        >
          Approve Validator
        </button>
      )}

      {isWaiting && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Spinner />
            <span className="text-gray-300">
              {isWriting ? "Waiting for wallet..." : "Confirming transaction..."}
            </span>
          </div>

          {txHash && (
            <div className="mt-2 p-4 bg-gray-800 rounded-lg w-full max-w-md">
              <p className="text-gray-500 text-xs mb-1">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-300 truncate flex-1">
                  {txHash}
                </code>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap"
                  >
                    View →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
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
    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  );
}
