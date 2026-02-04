# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BringID Validator for EIP-8004 - A Solidity smart contract that integrates BringID's privacy-preserving identity verification with EIP-8004 Trustless Agents for Sybil resistance.

## Key Architecture

- **BringIDValidator8004.sol**: Main validator contract
  - `validate(agentId, proof)`: Validate single credential
  - `validateBatch(agentId, proofs)`: Validate multiple credentials atomically
  - Calls both `validationRequest()` and `validationResponse()` in single transaction
  - Stores nullifier in `responseHash` for Sybil tracking

- **One credential = one agent**: Each credential (nullifier) can only ever be used for one agent
  - CredentialRegistry uses `context=0` (constant), so nullifier can only be used once globally
  - Consuming apps track nullifiers via `responseHash` to detect same human across apps

- **Frontrunning protection**: `proof.semaphoreProof.message` must equal `agentId`
  - Proof is cryptographically bound to specific agent
  - Prevents attackers from stealing proofs from mempool

- **Score capping**: Credential scores > 100 are capped to 100 for EIP-8004 compliance

## Build & Test Commands

```bash
# Build
forge build

# Run all tests
forge test

# Run tests with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_Validate_WithValidProof

# Check coverage
forge coverage

# Format code
forge fmt
```

## Project Structure

```
src/
├── BringIDValidator8004.sol      # Main contract
└── interfaces/
    ├── IValidationRegistry.sol   # EIP-8004 interface
    └── ICredentialRegistry.sol   # BringID interface

test/
├── BringIDValidator8004.t.sol    # Tests (29 tests, 100% coverage)
└── mocks/
    ├── MockValidationRegistry.sol
    └── MockCredentialRegistry.sol

sdk/                              # @bringid/validator8004 TypeScript SDK
├── src/
│   ├── index.ts                  # Main exports
│   ├── client.ts                 # Validator8004Client class
│   ├── types.ts                  # TypeScript types
│   └── abi.ts                    # Contract ABIs
├── package.json
└── tsconfig.json

docs/
└── SPEC.md                       # Full specification
```

## SDK Commands

```bash
# Install SDK dependencies
cd sdk && npm install

# Build SDK
npm run build

# Typecheck
npm run typecheck
```

## Key Dependencies

- OpenZeppelin Contracts (Base64 encoding)
- forge-std (testing)

## Important Notes

- Requires operator approval: `identityRegistry.setApprovalForAll(validator, true)`
- Tag used: `"bringid-operator-humanity"`
- requestURI format: `data:application/octet-stream;base64,<encoded(proof)>`
- requestHash: `keccak256(requestURI)`
- Nullifier is constant per credential (same human = same nullifier regardless of agent)
