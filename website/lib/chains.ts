import { base, baseSepolia } from "wagmi/chains";

export const SUPPORTED_CHAINS = [base, baseSepolia] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export function getChainById(chainId: number) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

export function getBlockExplorerUrl(chainId: number, txHash: string) {
  const chain = getChainById(chainId);
  if (!chain?.blockExplorers?.default) return null;
  return `${chain.blockExplorers.default.url}/tx/${txHash}`;
}
