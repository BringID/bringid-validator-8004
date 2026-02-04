// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ISemaphore
/// @notice Minimal interface for Semaphore proof structure
interface ISemaphore {
    struct SemaphoreProof {
        uint256 merkleTreeDepth;
        uint256 merkleTreeRoot;
        uint256 nullifier;
        uint256 message;
        uint256 scope;
        uint256[8] points;
    }
}

/// @title ICredentialRegistry
/// @notice Interface for BringID Credential Registry
interface ICredentialRegistry {
    struct CredentialGroupProof {
        uint256 credentialGroupId;
        ISemaphore.SemaphoreProof semaphoreProof;
    }

    /// @notice Validates proof and reverts if nullifier already used
    /// @param context_ The context for nullifier uniqueness (typically agentId)
    /// @param proof_ The credential group proof to validate
    function validateProof(
        uint256 context_,
        CredentialGroupProof memory proof_
    ) external;

    /// @notice Get the score for a credential group
    /// @param credentialGroupId_ The credential group ID
    /// @return The score associated with this credential group
    function credentialGroupScore(
        uint256 credentialGroupId_
    ) external view returns (uint256);
}
