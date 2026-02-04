// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IValidationRegistry} from "../../src/interfaces/IValidationRegistry.sol";

/// @title MockValidationRegistry
/// @notice Mock implementation of EIP-8004 Validation Registry for testing
contract MockValidationRegistry is IValidationRegistry {
    struct ValidationStatus {
        address validatorAddress;
        uint256 agentId;
        uint8 response;
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        bool exists;
    }

    mapping(bytes32 => ValidationStatus) public validations;
    mapping(uint256 => bytes32[]) public agentValidations;

    /// @notice Whether to require operator approval (for testing)
    bool public requiresOperatorApproval;

    /// @notice Mapping of approved operators per agent
    mapping(uint256 => mapping(address => bool)) public approvedOperators;

    /// @notice Emitted when a validation request is registered
    event ValidationRequested(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 requestHash,
        string requestURI
    );

    /// @notice Emitted when a validation response is submitted
    event ValidationResponseSubmitted(
        bytes32 indexed requestHash,
        uint8 response,
        bytes32 responseHash,
        string tag
    );

    /// @notice Set whether operator approval is required
    function setRequiresOperatorApproval(bool _requires) external {
        requiresOperatorApproval = _requires;
    }

    /// @notice Approve an operator for an agent
    function setApprovalForAll(uint256 agentId, address operator, bool approved) external {
        approvedOperators[agentId][operator] = approved;
    }

    /// @inheritdoc IValidationRegistry
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external override {
        // Check not already registered
        require(!validations[requestHash].exists, "Request already exists");

        // Check operator approval if required
        if (requiresOperatorApproval) {
            require(
                approvedOperators[agentId][msg.sender],
                "Caller not approved as operator"
            );
        }

        validations[requestHash] = ValidationStatus({
            validatorAddress: validatorAddress,
            agentId: agentId,
            response: 0,
            responseHash: bytes32(0),
            tag: "",
            lastUpdate: block.timestamp,
            exists: true
        });

        agentValidations[agentId].push(requestHash);

        emit ValidationRequested(validatorAddress, agentId, requestHash, requestURI);
    }

    /// @inheritdoc IValidationRegistry
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata, /* responseURI */
        bytes32 responseHash,
        string calldata tag
    ) external override {
        ValidationStatus storage s = validations[requestHash];
        require(s.exists, "Unknown request");
        require(msg.sender == s.validatorAddress, "Not the validator");

        s.response = response;
        s.responseHash = responseHash;
        s.tag = tag;
        s.lastUpdate = block.timestamp;

        emit ValidationResponseSubmitted(requestHash, response, responseHash, tag);
    }

    /// @notice Get the validation status for a request
    function getValidationStatus(bytes32 requestHash) external view returns (
        address validatorAddress,
        uint256 agentId,
        uint8 response,
        bytes32 responseHash,
        string memory tag,
        uint256 lastUpdate
    ) {
        ValidationStatus memory s = validations[requestHash];
        return (s.validatorAddress, s.agentId, s.response, s.responseHash, s.tag, s.lastUpdate);
    }

    /// @notice Get all validation request hashes for an agent
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory) {
        return agentValidations[agentId];
    }

    /// @notice Check if a validation exists
    function validationExists(bytes32 requestHash) external view returns (bool) {
        return validations[requestHash].exists;
    }
}
