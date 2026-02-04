# BringID Validator for EIP-8004

A validator contract that integrates BringID's privacy-preserving identity verification with EIP-8004 Trustless Agents, enabling Sybil resistance for AI agents by proving the uniqueness of the human operator behind each agent.

## Overview

The `BringIDValidator8004` contract:

1. Accepts BringID credential proofs from agent operators
2. Validates proofs via BringID's CredentialRegistry (Semaphore-based)
3. Submits validation requests and responses to EIP-8004's Validation Registry atomically
4. Stores nullifiers in `responseHash` for Sybil tracking by consuming apps

### Key Design Decisions

- **Atomic execution**: Both `validationRequest()` and `validationResponse()` are called in a single transaction
- **Operator approval**: Requires agent owner to approve the validator as an operator on Identity Registry via `setApprovalForAll()`
- **Proof encoding**: The contract encodes proofs as base64 data URIs for `requestURI`, computes `requestHash = keccak256(requestURI)`
- **Context = agentId**: Same human can verify different agents, but cannot reuse credentials for the same agent

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
├── foundry.toml                      # Foundry configuration
└── README.md
```

## Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd bringid-validator-8004

# Install dependencies
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

# Run specific test
forge test --match-test test_Validate_WithValidProof

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
# Load environment variables
source .env

# Deploy to a network (e.g., Sepolia)
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify
```

## Usage

### Prerequisites

Before using the validator, the agent owner must approve the validator contract as an operator on the EIP-8004 Identity Registry:

```solidity
identityRegistry.setApprovalForAll(validatorAddress, true);
```

### Validating a Single Credential

```solidity
// Create proof (obtained from BringID SDK)
ICredentialRegistry.CredentialGroupProof memory proof = ICredentialRegistry.CredentialGroupProof({
    credentialGroupId: 1,
    semaphoreProof: ISemaphore.SemaphoreProof({
        merkleTreeDepth: 20,
        merkleTreeRoot: <root>,
        nullifier: <nullifier>,
        message: <message>,
        scope: <scope>,
        points: [<proof-points>]
    })
});

// Validate
validator.validate(agentId, proof);
```

### Validating Multiple Credentials

```solidity
ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](2);
proofs[0] = proof1;
proofs[1] = proof2;

validator.validateBatch(agentId, proofs);
```

## Contract Interface

### Functions

#### `validate(uint256 agentId, CredentialGroupProof calldata proof)`

Validates a single BringID credential and submits to EIP-8004.

- **agentId**: The agent being verified
- **proof**: The credential group proof from BringID

#### `validateBatch(uint256 agentId, CredentialGroupProof[] calldata proofs)`

Validates multiple BringID credentials atomically.

- **agentId**: The agent being verified
- **proofs**: Array of credential group proofs

### Events

#### `OperatorHumanityVerified`

```solidity
event OperatorHumanityVerified(
    uint256 indexed agentId,
    bytes32 indexed requestHash,
    uint256 credentialGroupId,
    uint256 score,
    bytes32 nullifier
);
```

Emitted when an operator's humanity is successfully verified.

## Security Considerations

1. **Nullifier Uniqueness**: The CredentialRegistry ensures each nullifier can only be used once per context (agentId), preventing credential reuse for the same agent.

2. **Score Capping**: Credential scores are capped at 100 to comply with EIP-8004 response format.

3. **Atomic Execution**: Both validation request and response are submitted in the same transaction, ensuring consistency.

4. **Operator Approval**: The contract requires explicit operator approval on the Identity Registry, ensuring only authorized validators can submit validations.

## Gas Optimization

Batch validation is more gas-efficient per proof than individual validations due to amortized fixed costs:

| Operation | Gas per Proof |
|-----------|---------------|
| Single `validate()` | ~305,000 |
| `validateBatch()` (5 proofs) | ~262,000 |

## License

MIT
