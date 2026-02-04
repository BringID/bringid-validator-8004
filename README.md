# BringID Validator for EIP-8004

A validator contract that integrates BringID's privacy-preserving identity verification with EIP-8004 Trustless Agents, enabling Sybil resistance for AI agents by proving the uniqueness of the human operator behind each agent.

> **Full Specification**: See [docs/SPEC.md](docs/SPEC.md) for the complete technical specification.

## Overview

**The core approach**: Each BringID credential becomes a separate EIP-8004 validation:
- `response` = credential score (0-100)
- `responseHash` = nullifier (for Sybil tracking)

Consuming apps sum scores from all validations and track nullifiers to prevent reuse across agents. No new EIP-8004 contracts or interfaces are required.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EIP-8004 Validation Registry                       │
│                                                                         │
│  validationRequest(validator, agentId, requestURI, requestHash)         │
│  validationResponse(requestHash, response, "", responseHash, tag)       │
│                                                                         │
│  getValidationStatus() returns:                                         │
│    (validatorAddress, agentId, response, responseHash, tag, lastUpdate) │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
              ▲                 ▲                     │
              │                 │                     │
     validationRequest   validationResponse    getValidationStatus()
       (per proof)         (per proof)         getAgentValidations()
              └────────┬────────┘                     │
                       │ (atomic)                     │
┌──────────────────────┴──────────┐       ┌───────────▼───────────────────┐
│     BringID Validator           │       │     Consuming Apps            │
│                                 │       │                               │
│  validate(agentId, proof)       │       │  • Query validations          │
│  validateBatch(agentId, proofs) │       │  • Sum scores (response)      │
│                                 │       │  • Track nullifiers           │
│  Per proof (atomic):            │       │    (responseHash)             │
│  1. Validate proof              │       │                               │
│  2. Get credential score        │       │                               │
│  3. Encode proof → requestURI   │       │                               │
│  4. Call validationRequest      │       │                               │
│  5. Call validationResponse     │       │                               │
│                                 │       │                               │
└───────────┬─────────────────────┘       └───────────────────────────────┘
            │
            ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│ BringID CredentialRegistry│       │ EIP-8004 Identity Registry│
│        (Semaphore)        │       │        (ERC-721)          │
│                           │       │                           │
│  • validateProof()        │       │  • setApprovalForAll()    │
│  • credentialGroupScore() │       │    (approve validator)    │
│  • Nullifier tracking     │       │                           │
└───────────────────────────┘       └───────────────────────────┘
```

## How It Works

### Step 1: Operator Verifies Credentials via BringID

The operator proves control of real web accounts (GitHub, Uber, Airbnb, etc.) using BringID verification. Each verified account belongs to a credential group with an associated score and Semaphore proof.

### Step 2: Approve Validator as Operator (One-Time)

The agent owner approves the BringIDValidator contract as an operator on the Identity Registry:

```solidity
identityRegistry.setApprovalForAll(bringIdValidator, true);
```

### Step 3: Submit Validations (Atomic)

Submit all credentials in a single transaction:

```solidity
// Submit all proofs atomically - if any fails, entire transaction reverts
bringIdValidator.validateBatch(agentId, proofs);

// Or submit one at a time
bringIdValidator.validate(agentId, proof);
```

### Step 4: Consuming Apps Query Validations

Apps use EIP-8004's `getValidationStatus()` to get scores AND nullifiers directly:

```solidity
bytes32[] memory hashes = validationRegistry.getAgentValidations(agentId);

(address validator, uint256 agentId, uint8 response, bytes32 responseHash, string memory tag, uint256 lastUpdate)
    = validationRegistry.getValidationStatus(requestHash);
// responseHash = nullifier for Sybil tracking
```

## Project Structure

```
bringid-validator-8004/
├── src/
│   ├── BringIDValidator8004.sol      # Main validator contract
│   └── interfaces/
│       ├── IValidationRegistry.sol   # EIP-8004 interface
│       └── ICredentialRegistry.sol   # BringID interface
├── test/
│   ├── BringIDValidator8004.t.sol    # Comprehensive tests
│   └── mocks/
│       ├── MockValidationRegistry.sol
│       └── MockCredentialRegistry.sol
├── script/
│   └── Deploy.s.sol                  # Deployment scripts
├── docs/
│   └── SPEC.md                       # Full specification
├── foundry.toml
└── README.md
```

## Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Setup

```bash
git clone https://github.com/BringID/bringid-validator-8004.git
cd bringid-validator-8004
forge install
```

## Building

```bash
forge build
```

## Testing

```bash
# Run all tests
forge test

# Run tests with verbosity
forge test -vvv

# Run with gas reporting
forge test --gas-report

# Check coverage
forge coverage
```

## Deployment

### Environment Setup

Create a `.env` file:

```bash
PRIVATE_KEY=<your-deployer-private-key>
VALIDATION_REGISTRY=<eip8004-validation-registry-address>
CREDENTIAL_REGISTRY=<bringid-credential-registry-address>
```

### Deploy

```bash
source .env
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify
```

## Integration Examples

### For Agent Operators (TypeScript)

```typescript
import { BringID } from "bringid";
import { ethers } from "ethers";

async function registerWithSybilResistance() {
  const bringid = new BringID();
  const signer = await getSigner();

  // 1. Register agent via EIP-8004 Identity Registry (ERC-721)
  const identityRegistry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);
  const tx = await identityRegistry.register("ipfs://Qm...");
  const receipt = await tx.wait();
  const agentId = parseAgentId(receipt);

  // 2. Generate credential proofs with agentId as message (frontrun protection)
  const proofs = await bringid.generateProofs({ message: agentId });

  // 3. Approve BringIDValidator as operator (one-time)
  await identityRegistry.setApprovalForAll(BRINGID_VALIDATOR, true);

  // 4. Submit all validations in one transaction (atomic)
  const bringidValidator = new ethers.Contract(BRINGID_VALIDATOR, BRINGID_ABI, signer);
  await bringidValidator.validateBatch(agentId, proofs);

  return agentId;
}
```

### For Clients (Querying Agent Score)

Install the SDK:

```bash
npm install @bringid/validator8004 viem
```

Query agent scores:

```typescript
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { Validator8004Client } from "@bringid/validator8004";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const validator8004 = new Validator8004Client(client, {
  validationRegistry: VALIDATION_REGISTRY,
  bringIdValidator: BRINGID_VALIDATOR,
});

// Get score and nullifiers for an agent
const { totalScore, nullifiers } = await validator8004.getAgentScore(BigInt(agentId));
```

## Registration File

Agents with BringID verification should include `"bringid-operator-humanity"` in their `supportedTrust` array:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "MyTradingAgent",
  "description": "DeFi strategy executor with verified operator",
  "supportedTrust": [
    "reputation",
    "bringid-operator-humanity"
  ]
}
```

## Contract Interface

### Functions

#### `validate(uint256 agentId, CredentialGroupProof calldata proof)`

Validates a single BringID credential and submits to EIP-8004.

#### `validateBatch(uint256 agentId, CredentialGroupProof[] calldata proofs)`

Validates multiple BringID credentials atomically. If any proof fails, the entire transaction reverts.

### Events

```solidity
event OperatorHumanityVerified(
    uint256 indexed agentId,
    bytes32 indexed requestHash,
    uint256 credentialGroupId,
    uint256 score,
    bytes32 nullifier
);
```

## Security Considerations

1. **Frontrunning Protection**: The Semaphore proof's `message` field must equal the `agentId`. This cryptographically binds each proof to a specific agent, preventing attackers from stealing proofs from the mempool and using them for different agents.

2. **One Credential = One Agent**: Each credential (nullifier) can only be used for one agent ever. The CredentialRegistry uses `context=0` (constant) for global nullifier tracking.

3. **Atomic Execution**: Both `validate()` and `validateBatch()` are atomic. For batch operations, if any proof fails validation, the entire transaction reverts.

4. **Operator Approval**: Agent owners must approve the BringIDValidator as an operator on the Identity Registry.

5. **Proof Auditability**: Each proof is encoded as a base64 data URI (`requestURI`) with `requestHash = keccak256(requestURI)`.

6. **Nullifier in responseHash**: The nullifier is stored in EIP-8004's `responseHash` field, queryable via `getValidationStatus()`. Consuming apps can track nullifiers across their platform.

7. **Validation Age**: Apps should check `lastUpdate` from `getValidationStatus()` and may reject stale validations.

8. **Privacy Preservation**: BringID verification happens off-chain. Only scores and nullifiers are stored on-chain.

## References

- [EIP-8004: Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004)
- [BringID CredentialRegistry](https://github.com/BringID/identity-registry)
- [BringID SDK](https://github.com/bringID/bringid)
- [Semaphore Protocol](https://semaphore.pse.dev/)

## License

MIT
