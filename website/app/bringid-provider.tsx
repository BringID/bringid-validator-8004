"use client";

import { useAccount, useWalletClient } from "wagmi";
import { BringIDModal } from "bringid/react";
import { type ReactNode } from "react";

export function BringIDModalProvider({ children }: { children: ReactNode }) {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Use dev mode for Base Sepolia (testnet)
  const isTestnet = chain?.id === 84532;

  return (
    <>
      {walletClient && (
        <BringIDModal
          mode={isTestnet ? "dev" : undefined}
          address={address}
          generateSignature={(message: string) =>
            walletClient.signMessage({ message })
          }
          theme="dark"
        />
      )}
      {children}
    </>
  );
}
