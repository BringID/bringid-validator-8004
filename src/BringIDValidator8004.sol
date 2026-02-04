// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";
import {ICredentialRegistry, ISemaphore} from "./interfaces/ICredentialRegistry.sol";

/// @title BringIDValidator8004
/// @notice Validates BringID credentials and submits to EIP-8004 Validation Registry
/// @dev Requires operator approval on Identity Registry for atomic execution
contract BringIDValidator8004 {
    /// @notice The EIP-8004 Validation Registry contract
    IValidationRegistry public immutable validationRegistry;

    /// @notice The BringID Credential Registry contract
    ICredentialRegistry public immutable credentialRegistry;

    /// @notice Tag used for validation responses
    string public constant TAG = "bringid-operator-humanity";

    /// @notice Prefix for data URI encoding
    string public constant DATA_URI_PREFIX = "data:application/octet-stream;base64,";

    /// @notice Emitted when an operator's humanity is verified
    /// @param agentId The agent that was verified
    /// @param requestHash The hash of the validation request
    /// @param credentialGroupId The credential group used for verification
    /// @param score The raw score from the credential group
    /// @param nullifier The nullifier for Sybil tracking
    event OperatorHumanityVerified(
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint256 credentialGroupId,
        uint256 score,
        bytes32 nullifier
    );

    /// @notice Creates a new BringIDValidator8004 instance
    /// @param _validationRegistry Address of the EIP-8004 Validation Registry
    /// @param _credentialRegistry Address of the BringID Credential Registry
    constructor(address _validationRegistry, address _credentialRegistry) {
        require(_validationRegistry != address(0), "Invalid validation registry");
        require(_credentialRegistry != address(0), "Invalid credential registry");
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
        require(proofs.length > 0, "Empty proofs array");
        for (uint256 i = 0; i < proofs.length; i++) {
            _validate(agentId, proofs[i]);
        }
    }

    /// @notice Internal function to validate a single proof and submit to registry
    /// @param agentId The agent being verified
    /// @param proof The credential group proof to validate
    function _validate(
        uint256 agentId,
        ICredentialRegistry.CredentialGroupProof calldata proof
    ) internal {
        // Prevent frontrunning: proof must commit to this specific agentId
        require(proof.semaphoreProof.message == agentId, "Proof not for this agent");

        // Validate proof via BringID CredentialRegistry
        // Context = 0 (constant) ensures one credential can only be used for one agent ever
        credentialRegistry.validateProof(0, proof);

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
