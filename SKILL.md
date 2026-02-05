# Skill: Verify Operator Humanity

This guide describes how an EIP-8004 agent can verify the humanity of its operator using BringID credentials.

## Overview

BringID provides privacy-preserving identity verification using zero-knowledge proofs. Each verified credential (GitHub, Uber, Airbnb, etc.) has an associated score. The total score indicates the operator's humanity level.

## Prerequisites

- Agent registered on EIP-8004 Identity Registry (you have an `agentId`)
- Operator has verified credentials via BringID
- BringID SDK installed: `npm install bringid`

## Step 1: Generate Credential Proofs

The operator generates Semaphore proofs for their verified credentials:

```typescript
import { BringID } from "bringid";

const bringid = new BringID();

// Generate proofs with agentId as message (frontrun protection)
const proofs = await bringid.generateProofs({
  message: agentId,  // Binds proofs to this specific agent
});
```

**Important**: The `message` field must equal the `agentId`. This cryptographically binds each proof to your agent, preventing attackers from stealing proofs.

## Step 2: Approve BringID Validator (One-Time)

The agent owner must approve the BringIDValidator contract as an operator:

```typescript
import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";

const IDENTITY_REGISTRY = "0x...";
const BRINGID_VALIDATOR = "0x...";

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
});

// One-time approval
await walletClient.writeContract({
  address: IDENTITY_REGISTRY,
  abi: [
    {
      name: "setApprovalForAll",
      type: "function",
      inputs: [
        { name: "operator", type: "address" },
        { name: "approved", type: "bool" },
      ],
      outputs: [],
    },
  ],
  functionName: "setApprovalForAll",
  args: [BRINGID_VALIDATOR, true],
});
```

## Step 3: Submit Validations

Submit all credential proofs in a single atomic transaction:

```typescript
const BRINGID_VALIDATOR = "0x...";

// Submit all proofs atomically
await walletClient.writeContract({
  address: BRINGID_VALIDATOR,
  abi: [
    {
      name: "validateBatch",
      type: "function",
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
      outputs: [],
    },
  ],
  functionName: "validateBatch",
  args: [agentId, proofs],
});
```

If any proof fails, the entire transaction reverts.

## Step 4: Query Your Score

After submission, verify the validations were recorded:

```typescript
import { createPublicClient, http } from "viem";
import { Validator8004Client } from "@bringid/validator8004";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const validator8004 = new Validator8004Client(client, {
  validationRegistry: "0x...",
  bringIdValidator: "0x...",
});

const { totalScore, nullifiers } = await validator8004.getAgentScore(
  BigInt(agentId)
);

console.log(`Operator humanity score: ${totalScore}`);
```

## Step 5: Advertise in Registration File

Update your agent's registration file to advertise BringID support:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "MyAgent",
  "description": "Agent with verified human operator",
  "supportedTrust": [
    "bringid-operator-humanity"
  ]
}
```

## Complete Example

```typescript
import { BringID } from "bringid";
import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { Validator8004Client } from "@bringid/validator8004";

const IDENTITY_REGISTRY = "0x...";
const VALIDATION_REGISTRY = "0x...";
const BRINGID_VALIDATOR = "0x...";

async function verifyOperatorHumanity(agentId: bigint) {
  const bringid = new BringID();
  const account = privateKeyToAccount("0x...");

  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  // 1. Generate proofs bound to this agent
  const proofs = await bringid.generateProofs({
    message: agentId,
  });

  if (proofs.length === 0) {
    throw new Error("No verified credentials found");
  }

  // 2. Approve validator (skip if already approved)
  await walletClient.writeContract({
    address: IDENTITY_REGISTRY,
    abi: [{
      name: "setApprovalForAll",
      type: "function",
      inputs: [
        { name: "operator", type: "address" },
        { name: "approved", type: "bool" },
      ],
      outputs: [],
    }],
    functionName: "setApprovalForAll",
    args: [BRINGID_VALIDATOR, true],
  });

  // 3. Submit validations
  await walletClient.writeContract({
    address: BRINGID_VALIDATOR,
    abi: [{
      name: "validateBatch",
      type: "function",
      inputs: [
        { name: "agentId", type: "uint256" },
        { name: "proofs", type: "tuple[]", components: [
          { name: "credentialGroupId", type: "uint256" },
          { name: "semaphoreProof", type: "tuple", components: [
            { name: "merkleTreeDepth", type: "uint256" },
            { name: "merkleTreeRoot", type: "uint256" },
            { name: "nullifier", type: "uint256" },
            { name: "message", type: "uint256" },
            { name: "scope", type: "uint256" },
            { name: "points", type: "uint256[8]" },
          ]},
        ]},
      ],
      outputs: [],
    }],
    functionName: "validateBatch",
    args: [agentId, proofs],
  });

  // 4. Verify submission
  const validator8004 = new Validator8004Client(publicClient, {
    validationRegistry: VALIDATION_REGISTRY,
    bringIdValidator: BRINGID_VALIDATOR,
  });

  const { totalScore } = await validator8004.getAgentScore(agentId);
  console.log(`Verification complete. Total score: ${totalScore}`);

  return totalScore;
}
```

## Key Constraints

| Constraint | Description |
|------------|-------------|
| One credential = one agent | Each nullifier can only be used once globally |
| Frontrun protection | Proof must have `message == agentId` |
| Atomic execution | Batch fails entirely if any proof invalid |
| Score cap | Individual scores capped at 100 |

## References

- [Full Specification](docs/SPEC.md)
- [SDK Documentation](sdk/README.md)
- [BringID SDK](https://github.com/bringID/bringid)
- [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004)
