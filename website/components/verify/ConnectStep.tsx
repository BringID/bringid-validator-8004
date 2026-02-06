"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";

interface ConnectStepProps {
  targetChainId: number;
  onComplete: () => void;
}

export function ConnectStep({ targetChainId, onComplete }: ConnectStepProps) {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chain?.id === targetChainId;

  useEffect(() => {
    if (isConnected && isCorrectChain) {
      onComplete();
    }
  }, [isConnected, isCorrectChain, onComplete]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-neutral-400 mb-8">
        Connect the wallet that owns the agent you want to verify.
      </p>

      <div className="flex justify-center mb-6">
        <ConnectButton />
      </div>

      {isConnected && !isCorrectChain && (
        <div className="mt-6 p-4 bg-accent/10 border border-accent/30">
          <p className="text-accent mb-4">
            Please switch to {targetChainId === 84532 ? "Base Sepolia" : "Base"}{" "}
            to continue.
          </p>
          <button
            onClick={() => switchChain?.({ chainId: targetChainId })}
            className="px-4 py-2 bg-accent text-black font-medium hover:bg-yellow-300"
          >
            Switch Network
          </button>
        </div>
      )}
    </div>
  );
}
