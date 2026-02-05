import { type Address } from "viem";

export const CONTRACTS = {
  8453: {
    bringIdValidator: "0x0000000000000000000000000000000000000000" as Address, // TBD
    validationRegistry: "0x0000000000000000000000000000000000000000" as Address, // TBD
    identityRegistry: "0x0000000000000000000000000000000000000000" as Address, // TBD
  },
  84532: {
    bringIdValidator: "0x5001768A2F798f57DaCa66C63b4E5c657bDAaC31" as Address,
    validationRegistry: "0x653B506f10bF1Ccc63578cC34E3e991fA7c8917B" as Address,
    identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as Address,
  },
} as const;

export type ContractAddresses = (typeof CONTRACTS)[keyof typeof CONTRACTS];

export function getContracts(chainId: number): ContractAddresses | null {
  if (chainId in CONTRACTS) {
    return CONTRACTS[chainId as keyof typeof CONTRACTS];
  }
  return null;
}

// BringID Validator ABI (minimal)
export const bringIdValidatorAbi = [
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      {
        name: "proof",
        type: "tuple",
        components: [
          { name: "credentialGroupId", type: "uint256" },
          {
            name: "semaphoreProof",
            type: "tuple",
            components: [
              { name: "merkleTreeDepth", type: "uint256" },
              { name: "merkleTreeRoot", type: "uint256" },
              { name: "nullifier", type: "uint256" },
              { name: "message", type: "uint256" },
              { name: "scope", type: "uint256" },
              { name: "points", type: "uint256[8]" },
            ],
          },
        ],
      },
    ],
    name: "validate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      {
        name: "proofs",
        type: "tuple[]",
        components: [
          { name: "credentialGroupId", type: "uint256" },
          {
            name: "semaphoreProof",
            type: "tuple",
            components: [
              { name: "merkleTreeDepth", type: "uint256" },
              { name: "merkleTreeRoot", type: "uint256" },
              { name: "nullifier", type: "uint256" },
              { name: "message", type: "uint256" },
              { name: "scope", type: "uint256" },
              { name: "points", type: "uint256[8]" },
            ],
          },
        ],
      },
    ],
    name: "validateBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Identity Registry ABI (minimal)
export const identityRegistryAbi = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Validation Registry ABI (minimal)
export const validationRegistryAbi = [
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getAgentValidations",
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "requestHash", type: "bytes32" }],
    name: "getValidation",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "validator", type: "address" },
          { name: "agentId", type: "uint256" },
          { name: "tag", type: "string" },
          { name: "score", type: "uint256" },
          { name: "responseHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
