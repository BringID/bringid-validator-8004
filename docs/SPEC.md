# Sybil Resistance for EIP-8004 Agents via BringID

## Overview

This document describes how to add Sybil resistance to EIP-8004 Trustless Agents using BringID's privacy-preserving identity verification.

**The core approach**: Each BringID credential becomes a separate EIP-8004 validation:
- `response` = credential score
- `responseHash` = nullifier (for Sybil tracking)

Consuming apps sum scores from all validations and track nullifiers to prevent reuse across agents.

No new EIP-8004 contracts or interfaces are required.

---

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
│  validate(agentId,      │       │  • Query validations          │
│                   proof)        │       │  • Sum scores (response)      │
│                                 │       │  • Track nullifiers           │
│  validateBatch(agentId, │       │    (responseHash)             │
│                        proofs[])│       │                               │
│                                 │       │                               │
│  Per proof (atomic):            │       │                               │
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
│  BringID CredentialRegistry│       │  EIP-8004 Identity Registry│
│        (Semaphore)        │       │        (ERC-721)          │
│                           │       │                           │
│  • validateProof()        │       │  • setApprovalForAll()    │
│  • credentialGroupScore() │       │    (approve validator)    │
│  • Nullifier tracking     │       │                           │
└───────────────────────────┘       └───────────────────────────┘
```

---

## How It Works

### Step 1: Operator Verifies Credentials via BringID

The operator proves control of real web accounts (GitHub, Uber, Airbnb, etc.) using BringID's MPC-TLS verification. Each verified account belongs to a credential group with an associated score and Semaphore proof.

### Step 2: Approve Validator as Operator (One-Time)

The agent owner approves the BringIDValidator contract as an operator on the Identity Registry:

```solidity
identityRegistry.setApprovalForAll(bringIdValidator, true);
```

This allows the validator to call `validationRequest()` on behalf of the agent.

### Step 3: Submit Validations (Atomic)

Submit all credentials in a single transaction using `validateBatch()`:

```solidity
// Submit all proofs atomically - if any fails, entire transaction reverts
bringIdValidator.validateBatch(agentId, proofs);

// Or submit one at a time
bringIdValidator.validate(agentId, proof);
```

For each proof, the validator atomically:
1. Validates proof via CredentialRegistry (reverts if nullifier reused)
2. Gets credential score
3. Encodes proof as base64 data URI (`requestURI`)
4. Computes `requestHash = keccak256(requestURI)`
5. Calls `validationRequest()` to register the request
6. Calls `validationResponse()` with score and nullifier

If any proof fails validation, the entire batch reverts.

### Step 4: Consuming Apps Query Validations

Consuming apps use EIP-8004's `getValidationStatus()` to get scores AND nullifiers directly:

```solidity
// Get all validations for an agent
bytes32[] memory hashes = validationRegistry.getAgentValidations(agentId);

// Get validation details including nullifier (responseHash)
(
    address validatorAddress,
    uint256 agentId,
    uint8 response,
    bytes32 responseHash,  // <-- nullifier for Sybil tracking
    string memory tag,
    uint256 lastUpdate
) = validationRegistry.getValidationStatus(requestHash);
```

---

## Registration File

The agent's `agentURI` (tokenURI) resolves to a registration file per EIP-8004. BringID support is advertised via `supportedTrust`:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "MyTradingAgent",
  "description": "DeFi strategy executor with verified operator",
  "image": "https://example.com/agent.png",
  "services": [
    {
      "name": "A2A",
      "endpoint": "https://agent.example/.well-known/agent-card.json",
      "version": "0.3.0"
    }
  ],
  "registrations": [
    {
      "agentId": 42,
      "agentRegistry": "eip155:8453:0x742d35Cc..."
    }
  ],
  "supportedTrust": [
    "reputation",
    "bringid-operator-humanity"
  ]
}
```

Agents with BringID verification SHOULD include `"bringid-operator-humanity"` in their `supportedTrust` array.

---

## BringID Validator Contract

The BringID validator verifies credential proofs and submits to EIP-8004's Validation Registry. It encodes proofs as base64 data URIs and calls both `validationRequest()` and `validationResponse()` atomically. Supports single and batch operations:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISemaphore} from "semaphore-protocol/interfaces/ISemaphore.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

interface IValidationRegistry {
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external;
    
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external;
}

interface ICredentialRegistry {
    struct CredentialGroupProof {
        uint256 credentialGroupId;
        ISemaphore.SemaphoreProof semaphoreProof;
    }
    
    /// @notice Validates proof and reverts if nullifier already used
    function validateProof(
        uint256 context_,
        CredentialGroupProof memory proof_
    ) external;
    
    function credentialGroupScore(
        uint256 credentialGroupId_
    ) external view returns (uint256);
}

/// @title BringIDValidator
/// @notice Validates BringID credentials and submits to EIP-8004 Validation Registry
/// @dev Requires operator approval on Identity Registry for atomic execution
contract BringIDValidator {
    IValidationRegistry public immutable validationRegistry;
    ICredentialRegistry public immutable credentialRegistry;
    
    string public constant TAG = "bringid-operator-humanity";
    string public constant DATA_URI_PREFIX = "data:application/octet-stream;base64,";
    
    event OperatorHumanityVerified(
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint256 credentialGroupId,
        uint256 score,
        bytes32 nullifier
    );
    
    constructor(address _validationRegistry, address _credentialRegistry) {
        validationRegistry = IValidationRegistry(_validationRegistry);
        credentialRegistry = ICredentialRegistry(_credentialRegistry);
    }
    
    /// @notice Validate a BringID credential and submit to EIP-8004 (atomic)
    /// @param agentId The agent being verified
    /// @param proof The credential group proof from BringID
    /// @dev Requires this contract to be approved as operator on Identity Registry
    function validate(
        uint256 agentId,
        ICredentialRegistry.CredentialGroupProof calldata proof
    ) external {
        _validate(agentId, proof);
    }
    
    /// @notice Validate multiple BringID credentials and submit to EIP-8004 (atomic)
    /// @param agentId The agent being verified
    /// @param proofs Array of credential group proofs from BringID
    /// @dev Requires this contract to be approved as operator on Identity Registry
    /// @dev All proofs are validated atomically - if any fails, entire transaction reverts
    function validateBatch(
        uint256 agentId,
        ICredentialRegistry.CredentialGroupProof[] calldata proofs
    ) external {
        for (uint256 i = 0; i < proofs.length; i++) {
            _validate(agentId, proofs[i]);
        }
    }
    
    /// @notice Internal function to validate a single proof and submit to registry
    function _validate(
        uint256 agentId,
        ICredentialRegistry.CredentialGroupProof calldata proof
    ) internal {
        // Validate proof via BringID CredentialRegistry first
        // Context = agentId, so same human can verify different agents
        uint256 context = agentId;
        credentialRegistry.validateProof(context, proof);
        
        // Get score for this credential group
        uint256 score = credentialRegistry.credentialGroupScore(proof.credentialGroupId);
        
        // Cap score at 100 for EIP-8004 response
        uint8 responseScore = score > 100 ? 100 : uint8(score);
        
        // Nullifier for Sybil tracking
        bytes32 nullifier = bytes32(proof.semaphoreProof.nullifier);
        
        // Encode proof as base64 data URI for requestURI
        bytes memory proofData = abi.encode(proof);
        string memory requestURI = string(
            abi.encodePacked(DATA_URI_PREFIX, Base64.encode(proofData))
        );
        
        // Compute requestHash as commitment to requestURI
        bytes32 requestHash = keccak256(bytes(requestURI));
        
        // Atomic: Register validation request (requires operator approval)
        validationRegistry.validationRequest(
            address(this),
            agentId,
            requestURI,
            requestHash
        );
        
        // Atomic: Submit validation response
        validationRegistry.validationResponse(
            requestHash,
            responseScore,
            "",
            nullifier,
            TAG
        );
        
        emit OperatorHumanityVerified(agentId, requestHash, proof.credentialGroupId, score, nullifier);
    }
}
```

---

## Integration Flow

### For Agent Operators

```typescript
import { BringID } from "bringid";
import { ethers } from "ethers";

const IDENTITY_REGISTRY = "0x...";
const BRINGID_VALIDATOR = "0x...";

async function registerWithSybilResistance() {
  const bringid = new BringID();
  const signer = await getSigner();
  
  // 1. Generate credential proofs off-chain
  const proofs = await bringid.generateProofs();
  
  // 2. Register agent via EIP-8004 Identity Registry (ERC-721)
  const identityRegistry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);
  const tx = await identityRegistry.register("ipfs://Qm...");
  const receipt = await tx.wait();
  const agentId = parseAgentId(receipt);
  
  // 3. Approve BringIDValidator as operator (one-time)
  await identityRegistry.setApprovalForAll(BRINGID_VALIDATOR, true);
  
  // 4. Submit all validations in one transaction (atomic)
  const bringidValidator = new ethers.Contract(BRINGID_VALIDATOR, BRINGID_ABI, signer);
  await bringidValidator.validateBatch(agentId, proofs);
  
  return agentId;
}

// Alternative: submit one at a time
async function submitSingleCredential(agentId: number, proof: CredentialGroupProof) {
  const bringidValidator = new ethers.Contract(BRINGID_VALIDATOR, BRINGID_ABI, signer);
  await bringidValidator.validate(agentId, proof);
}
```

### For Clients (Querying Agent Score)

```typescript
async function getAgentScore(agentId: number) {
  const validationRegistry = new ethers.Contract(VALIDATION_REGISTRY, VALIDATION_ABI, provider);
  
  // Get all validations for this agent
  const requestHashes = await validationRegistry.getAgentValidations(agentId);
  
  let totalScore = 0;
  const nullifiers: string[] = [];
  
  for (const hash of requestHashes) {
    // getValidationStatus returns responseHash (nullifier) directly
    const [validator, , response, responseHash, tag, lastUpdate] = 
      await validationRegistry.getValidationStatus(hash);
    
    if (validator === BRINGID_VALIDATOR && tag === "bringid-operator-humanity") {
      totalScore += response;
      nullifiers.push(responseHash);  // nullifier for Sybil tracking
    }
  }
  
  return { totalScore, nullifiers };
}
```

---

## Consuming Contracts

One of the key benefits of using EIP-8004's existing infrastructure is composability. Any smart contract can query the Identity and Validation registries to make decisions based on Sybil resistance.

### Example: Sybil-Resistant Airdrop

This contract distributes tokens to agents with verified human operators. It queries EIP-8004's Validation Registry directly for scores and nullifiers:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IIdentityRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
}

interface IValidationRegistry {
    function getValidationStatus(bytes32 requestHash) external view returns (
        address validatorAddress,
        uint256 agentId,
        uint8 response,
        bytes32 responseHash,  // nullifier for Sybil tracking
        string memory tag,
        uint256 lastUpdate
    );
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory);
}

/// @title SybilResistantAirdrop
/// @notice Distributes tokens to EIP-8004 agents with BringID humanity verification
/// @dev Queries EIP-8004 Validation Registry directly - no need to query BringID validator
contract SybilResistantAirdrop {
    using SafeERC20 for IERC20;
    
    IIdentityRegistry public immutable identityRegistry;
    IValidationRegistry public immutable validationRegistry;
    address public immutable bringIdValidator;
    
    IERC20 public immutable token;
    uint256 public immutable amountPerClaim;
    uint256 public immutable minTotalScore;
    uint256 public immutable maxValidationAge;
    
    string public constant BRINGID_TAG = "bringid-operator-humanity";
    
    // Track claimed nullifiers (responseHash from validations)
    mapping(bytes32 => bool) public claimedNullifiers;
    mapping(uint256 => bool) public claimedAgents;
    
    event Claimed(
        uint256 indexed agentId,
        address indexed recipient,
        uint256 amount,
        uint256 totalScore
    );
    
    error AgentNotOwned();
    error InsufficientScore(uint256 has, uint256 required);
    error NullifierAlreadyClaimed(bytes32 nullifier);
    error AlreadyClaimedByAgent(uint256 agentId);
    
    constructor(
        address _identityRegistry,
        address _validationRegistry,
        address _bringIdValidator,
        address _token,
        uint256 _amountPerClaim,
        uint256 _minTotalScore,
        uint256 _maxValidationAge
    ) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        validationRegistry = IValidationRegistry(_validationRegistry);
        bringIdValidator = _bringIdValidator;
        token = IERC20(_token);
        amountPerClaim = _amountPerClaim;
        minTotalScore = _minTotalScore;
        maxValidationAge = _maxValidationAge;
    }
    
    /// @notice Claim airdrop tokens for a verified agent
    /// @param agentId The EIP-8004 agent ID to claim for
    function claim(uint256 agentId) external {
        // Verify caller owns the agent (ERC-721)
        if (identityRegistry.ownerOf(agentId) != msg.sender) {
            revert AgentNotOwned();
        }
        
        if (claimedAgents[agentId]) {
            revert AlreadyClaimedByAgent(agentId);
        }
        
        // Get all validations for this agent
        bytes32[] memory requestHashes = validationRegistry.getAgentValidations(agentId);
        
        uint256 totalScore = 0;
        
        for (uint256 i = 0; i < requestHashes.length; i++) {
            (
                address validator,
                ,
                uint8 response,
                bytes32 nullifier,  // responseHash = nullifier
                string memory tag,
                uint256 lastUpdate
            ) = validationRegistry.getValidationStatus(requestHashes[i]);
            
            // Filter for BringID validations
            if (validator != bringIdValidator || !_compareStrings(tag, BRINGID_TAG)) {
                continue;
            }
            
            // Check validation age
            if (block.timestamp - lastUpdate > maxValidationAge) {
                continue;
            }
            
            // Check nullifier hasn't been claimed
            if (claimedNullifiers[nullifier]) {
                revert NullifierAlreadyClaimed(nullifier);
            }
            
            // Mark nullifier as claimed
            claimedNullifiers[nullifier] = true;
            
            totalScore += response;
        }
        
        if (totalScore < minTotalScore) {
            revert InsufficientScore(totalScore, minTotalScore);
        }
        
        claimedAgents[agentId] = true;
        token.safeTransfer(msg.sender, amountPerClaim);
        
        emit Claimed(agentId, msg.sender, amountPerClaim, totalScore);
    }
    
    /// @notice Check if an agent is eligible to claim
    function canClaim(uint256 agentId) external view returns (
        bool eligible, 
        string memory reason, 
        uint256 totalScore
    ) {
        if (claimedAgents[agentId]) {
            return (false, "Agent already claimed", 0);
        }
        
        bytes32[] memory requestHashes = validationRegistry.getAgentValidations(agentId);
        
        for (uint256 i = 0; i < requestHashes.length; i++) {
            (
                address validator,
                ,
                uint8 response,
                bytes32 nullifier,
                string memory tag,
                uint256 lastUpdate
            ) = validationRegistry.getValidationStatus(requestHashes[i]);
            
            if (validator != bringIdValidator || !_compareStrings(tag, BRINGID_TAG)) {
                continue;
            }
            
            if (block.timestamp - lastUpdate > maxValidationAge) {
                continue;
            }
            
            if (claimedNullifiers[nullifier]) {
                return (false, "Credential already used", totalScore);
            }
            
            totalScore += response;
        }
        
        if (totalScore < minTotalScore) {
            return (false, "Insufficient score", totalScore);
        }
        
        return (true, "Eligible", totalScore);
    }
    
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
```

### Off-Chain Verification

Consuming apps can verify BringID proofs off-chain:

```typescript
import { BringID, CredentialGroupProof } from "bringid";
import { ethers } from "ethers";

async function verifyAgentOffchain(
  agentId: number,
  proofs: CredentialGroupProof[],
  minScore: number
): Promise<{ valid: boolean; score: number; nullifiers: bigint[] }> {
  const bringid = new BringID();
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const credentialRegistry = new ethers.Contract(
    CREDENTIAL_REGISTRY,
    CREDENTIAL_REGISTRY_ABI,
    provider
  );
  
  let totalScore = 0;
  const nullifiers: bigint[] = [];
  
  for (const proof of proofs) {
    // Verify Semaphore proof off-chain
    const isValid = await bringid.verifyProofOffchain(proof);
    if (!isValid) {
      return { valid: false, score: 0, nullifiers: [] };
    }
    
    // Check credential group is active and get score
    const isActive = await credentialRegistry.credentialGroupIsActive(proof.credentialGroupId);
    if (!isActive) continue;
    
    const groupScore = await credentialRegistry.credentialGroupScore(proof.credentialGroupId);
    totalScore += Number(groupScore);
    nullifiers.push(proof.semaphoreProof.nullifier);
  }
  
  return {
    valid: totalScore >= minScore,
    score: totalScore,
    nullifiers
  };
}
```

---

## Security Considerations

1. **Atomic Execution**: Both `validate()` and `validateBatch()` are atomic. For batch operations, if any proof fails validation, the entire transaction reverts and no requests are registered.

2. **Operator Approval**: Agent owners must approve the BringIDValidator as an operator on the Identity Registry. This is a one-time setup per agent owner.

3. **Proof Auditability**: The validator encodes each proof as a base64 data URI (`requestURI`) and computes `requestHash = keccak256(requestURI)`. Both are emitted in the `ValidationRequest` event for off-chain auditability.

4. **Nullifier Tracking**: BringID's CredentialRegistry handles nullifier tracking globally. The same human always produces the same nullifier (per credential group + context), preventing credential reuse.

5. **Nullifier in responseHash**: The nullifier is stored in EIP-8004's `responseHash` field, queryable via `getValidationStatus()`. Consuming apps can track which nullifiers have been used for their specific use case (e.g., airdrop claims).

6. **Validation Age**: Apps should check `lastUpdate` from `getValidationStatus()` and may reject stale validations.

7. **Validator Trust**: The BringID validator address should be well-known. Apps verify they're querying validations from the legitimate validator.

8. **Privacy Preservation**: BringID's MPC-TLS verification happens off-chain. Only scores and nullifiers are stored on-chain.

---

## References

- [EIP-8004: Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004)
- [BringID CredentialRegistry](https://github.com/BringID/identity-registry)
- [BringID SDK](https://github.com/bringID/bringid)
- [Semaphore Protocol](https://semaphore.pse.dev/)
