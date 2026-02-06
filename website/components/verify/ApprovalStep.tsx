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
      <p className="text-neutral-400 mb-8">
        The BringID Validator needs approval to record validations for your
        agent.
      </p>

      {isCheckingApproval && (
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-neutral-500 text-sm">Checking approval status...</p>
        </div>
      )}

      {!isCheckingApproval && !isApproved && !isWaiting && (
        <button
          onClick={handleApprove}
          className="px-6 py-3 bg-accent text-black font-medium hover:bg-yellow-300"
        >
          Approve Validator
        </button>
      )}

      {isWaiting && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Spinner />
            <span className="text-neutral-300">
              {isWriting ? "Waiting for wallet..." : "Confirming transaction..."}
            </span>
          </div>

          {txHash && (
            <div className="mt-2 p-4 bg-[#0a0a0a] border border-surface-border w-full max-w-md">
              <p className="text-neutral-600 text-xs mb-1 font-mono">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-neutral-300 font-mono truncate flex-1">
                  {txHash}
                </code>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-yellow-300 text-sm whitespace-nowrap"
                  >
                    View &rarr;
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isApproved && (
        <div className="p-4 bg-accent/10 border border-accent/30">
          <p className="text-accent">Validator is approved.</p>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  );
}
