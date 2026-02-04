export const ValidationRegistryAbi = [
  {
    type: "function",
    name: "getAgentValidations",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getValidationStatus",
    inputs: [{ name: "requestHash", type: "bytes32" }],
    outputs: [
      { name: "validatorAddress", type: "address" },
      { name: "agentId", type: "uint256" },
      { name: "response", type: "uint8" },
      { name: "responseHash", type: "bytes32" },
      { name: "tag", type: "string" },
      { name: "lastUpdate", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

export const CredentialRegistryAbi = [
  {
    type: "function",
    name: "credentialGroupScore",
    inputs: [{ name: "credentialGroupId_", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "credentialGroupIsActive",
    inputs: [{ name: "credentialGroupId_", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;
