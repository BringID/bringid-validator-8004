"use client";

import { useAccount, useReadContract } from "wagmi";
import { useEffect } from "react";
import { identityRegistryAbi, getContracts } from "@/lib/contracts";

interface OwnershipStepProps {
  agentId: bigint;
  chainId: number;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function OwnershipStep({
  agentId,
  chainId,
  onComplete,
  onError,
}: OwnershipStepProps) {
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const {
    data: owner,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: contracts?.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: [agentId],
    chainId,
  });

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (isOwner) {
      onComplete();
    } else if (!isLoading && owner && !isOwner) {
      onError(
        `This wallet does not own agent #${agentId}. The owner is ${owner}.`
      );
    } else if (isError) {
      onError(error?.message || "Failed to verify ownership. Agent may not exist.");
    }
  }, [isOwner, isLoading, owner, isError, error, agentId, onComplete, onError]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Verifying Ownership</h2>
      <p className="text-gray-400 mb-8">
        Checking that you own agent #{agentId.toString()}...
      </p>

      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && isOwner && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400">
            Ownership verified! You own this agent.
          </p>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  );
}
