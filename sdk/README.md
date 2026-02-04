# @bringid/validator8004

SDK for querying BringID validations from EIP-8004 Validation Registry.

## Installation

```bash
npm install @bringid/validator8004 viem
```

## Usage

```typescript
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { Validator8004Client } from "@bringid/validator8004";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const validator8004 = new Validator8004Client(client, {
  validationRegistry: "0x...",  // EIP-8004 Validation Registry
  bringIdValidator: "0x...",    // BringID Validator contract
});

// Get agent score and nullifiers
const { totalScore, nullifiers, validations } = await validator8004.getAgentScore(
  BigInt(agentId)
);
console.log(`Agent ${agentId} has score ${totalScore}`);

// Filter by max validation age (e.g., 30 days)
const recentResult = await validator8004.getAgentScore(BigInt(agentId), {
  maxAge: BigInt(30 * 24 * 60 * 60),
});
```

## API

### `Validator8004Client`

#### Constructor

```typescript
new Validator8004Client(client: PublicClient, config: Validator8004ClientConfig)
```

- `client` - viem PublicClient for blockchain queries
- `config.validationRegistry` - Address of the EIP-8004 Validation Registry
- `config.bringIdValidator` - Address of the BringID Validator contract

#### Methods

##### `getAgentScore(agentId: bigint, options?: GetAgentScoreOptions): Promise<AgentScoreResult>`

Get the total BringID score and nullifiers for an agent.

Options:
- `maxAge?: bigint` - Maximum age of validations in seconds

Returns:
- `totalScore: number` - Sum of all validation scores
- `nullifiers: Hex[]` - Array of nullifiers for Sybil tracking
- `validations: BringIDValidation[]` - Individual validation details

##### `getValidationDetails(requestHash: Hex): Promise<ValidationDetails>`

Get details for a specific validation request.

##### `hasNullifier(agentId: bigint, nullifier: Hex): Promise<boolean>`

Check if a nullifier is associated with an agent.

## Exports

```typescript
// Client
export { Validator8004Client, BRINGID_TAG } from "@bringid/validator8004";

// ABIs for direct contract interaction
export { ValidationRegistryAbi, CredentialRegistryAbi } from "@bringid/validator8004";

// Types
export type {
  SemaphoreProof,
  CredentialGroupProof,
  ValidationDetails,
  BringIDValidation,
  AgentScoreResult,
  GetAgentScoreOptions,
  Validator8004ClientConfig,
} from "@bringid/validator8004";
```

## License

MIT
