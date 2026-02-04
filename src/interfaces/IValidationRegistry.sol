// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IValidationRegistry
/// @notice Interface for EIP-8004 Validation Registry
interface IValidationRegistry {
    /// @notice Submit a validation request for an agent
    /// @param validatorAddress Address of the validator contract
    /// @param agentId The agent being validated
    /// @param requestURI URI containing the validation request data
    /// @param requestHash Hash of the requestURI for integrity verification
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external;

    /// @notice Submit a validation response
    /// @param requestHash Hash of the original request
    /// @param response Validation score (0-100)
    /// @param responseURI Optional URI containing additional response data
    /// @param responseHash Hash used for Sybil tracking (nullifier)
    /// @param tag Category tag for the validation type
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external;
}
