# Verify Your Agent's Humanity via BringID

You are an EIP-8004 agent. Your operator (the human who owns you) can prove they are a real human by verifying through BringID. This gives you a sybil-resistance score that other agents and apps can trust.

## What This Does

- Your operator verifies real-world credentials through BringID — this includes OAuth-linked accounts (X, GitHub, Farcaster), MPC-TLS verified services (Binance KYC, Apple subscriptions), and identity protocols (zkPassport, Self). Each verification method maps to a separate Semaphore group.
- Each verified credential adds to your humanity score (0–100 per credential)
- The score and a nullifier are recorded on-chain in the EIP-8004 Validation Registry
- Other agents and apps can query your score to confirm a real human is behind you
- One credential = one agent. Your operator's credentials cannot be reused for another agent.

## Verification Flow

When your operator asks to verify your humanity, follow these steps:

### Step 1: Collect Agent ID

You need your EIP-8004 `agentId` (the token ID from the Identity Registry). If you don't already know it, ask your operator.

### Step 2: Send Operator to the Verification Page

Direct your operator to:

```
https://8004.bringid.org/verify?agentId={AGENT_ID}
```

Replace `{AGENT_ID}` with the actual numeric agent ID.

For Base Sepolia testnet, use:

```
https://8004.bringid.org/verify?agentId={AGENT_ID}&chain=84532
```

The default chain is Base Mainnet (8453).

Tell your operator something like:

> To verify your humanity, please go to this link: https://8004.bringid.org/verify?agentId={AGENT_ID}
>
> You'll need to:
> 1. Connect the wallet that owns this agent
> 2. Approve the BringID validator (one-time transaction)
> 3. Verify your accounts through BringID
> 4. Submit the proofs on-chain
>
> Once done, come back and let me know.

### Step 3: Confirm Verification

After your operator says they completed verification, check on-chain by querying the EIP-8004 Validation Registry.

**Using the `@bringid/validator8004` SDK (recommended):**

```typescript
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Validator8004Client } from "@bringid/validator8004";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const validator = new Validator8004Client(publicClient, {
  validationRegistry: "VALIDATION_REGISTRY_ADDRESS",
  bringIdValidator: "BRINGID_VALIDATOR_ADDRESS",
});

const { totalScore, validations } = await validator.getAgentScore(
  BigInt(AGENT_ID)
);

if (totalScore > 0) {
  // Operator humanity verified
}
```

**Using direct contract call:**

```typescript
const requestHashes = await publicClient.readContract({
  address: "VALIDATION_REGISTRY_ADDRESS",
  abi: validationRegistryAbi,
  functionName: "getAgentValidations",
  args: [BigInt(AGENT_ID)],
});

// If requestHashes.length > 0, the agent has BringID validations
```

If the score is 0 or no validations exist, the operator hasn't completed verification yet.

### Step 4: Report Result

Let your operator know the outcome:

- **Verified**: "Your humanity has been verified. Your agent now has a BringID score of {SCORE}. Other agents and apps can see this verification on-chain."
- **Not yet verified**: "I couldn't find your verification on-chain yet. Please make sure you completed all steps at the verification link. The transaction may still be confirming — try again in a minute."

## Contract Addresses

| Contract | Base Mainnet (8453) | Base Sepolia (84532) |
|---|---|---|
| BringID Validator | `TBD` | `TBD` |
| Validation Registry (EIP-8004) | `TBD` | `TBD` |
| Identity Registry (EIP-8004) | `TBD` | `TBD` |

## Advertising Verification

Once verified, your registration file (agentURI) should include `"bringid-operator-humanity"` in `supportedTrust`:

```json
{
  "supportedTrust": ["bringid-operator-humanity"]
}
```

This signals to other agents and consuming apps that your operator has completed BringID humanity verification.

## Important Notes

- **Privacy**: BringID uses MPC-TLS — no personal data is stored on-chain. Only scores and nullifiers are public.
- **One credential per agent**: Each verified account can only be linked to one agent globally. Your operator cannot reuse the same credentials for a different agent.
- **Frontrunning protection**: Proofs are cryptographically bound to your specific agentId and cannot be intercepted or reused.
- **Operator approval**: Your operator must approve the BringID Validator contract as an operator on the Identity Registry. The verification page handles this automatically.
