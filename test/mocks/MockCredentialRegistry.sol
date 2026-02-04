// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ICredentialRegistry, ISemaphore} from "../../src/interfaces/ICredentialRegistry.sol";

/// @title MockCredentialRegistry
/// @notice Mock implementation of BringID Credential Registry for testing
contract MockCredentialRegistry is ICredentialRegistry {
    /// @notice Mapping of credential group IDs to their scores
    mapping(uint256 => uint256) public credentialGroupScores;

    /// @notice Mapping of context + nullifier to whether it's been used
    mapping(bytes32 => bool) public usedNullifiers;

    /// @notice Whether to fail all proof validations (for testing)
    bool public shouldFailValidation;

    /// @notice Custom error message for failed validation
    string public failValidationMessage;

    /// @notice Emitted when a proof is validated
    event ProofValidated(
        uint256 indexed context,
        uint256 indexed credentialGroupId,
        uint256 nullifier
    );

    /// @notice Set the score for a credential group
    function setCredentialGroupScore(uint256 groupId, uint256 score) external {
        credentialGroupScores[groupId] = score;
    }

    /// @notice Set whether validation should fail
    function setShouldFailValidation(bool _shouldFail, string calldata message) external {
        shouldFailValidation = _shouldFail;
        failValidationMessage = message;
    }

    /// @notice Mark a nullifier as used (for testing edge cases)
    function markNullifierUsed(uint256 context, uint256 nullifier) external {
        bytes32 nullifierKey = keccak256(abi.encode(context, nullifier));
        usedNullifiers[nullifierKey] = true;
    }

    /// @inheritdoc ICredentialRegistry
    function credentialGroupScore(uint256 groupId) external view override returns (uint256) {
        return credentialGroupScores[groupId];
    }

    /// @inheritdoc ICredentialRegistry
    function validateProof(
        uint256 context_,
        CredentialGroupProof memory proof_
    ) external override {
        // Check if validation should fail for testing
        if (shouldFailValidation) {
            revert(failValidationMessage);
        }

        // Check if nullifier has already been used for this context
        bytes32 nullifierKey = keccak256(abi.encode(context_, proof_.semaphoreProof.nullifier));
        require(!usedNullifiers[nullifierKey], "Nullifier already used");

        // Mark nullifier as used
        usedNullifiers[nullifierKey] = true;

        emit ProofValidated(context_, proof_.credentialGroupId, proof_.semaphoreProof.nullifier);
    }

    /// @notice Check if a nullifier has been used for a context
    function isNullifierUsed(uint256 context, uint256 nullifier) external view returns (bool) {
        bytes32 nullifierKey = keccak256(abi.encode(context, nullifier));
        return usedNullifiers[nullifierKey];
    }
}
