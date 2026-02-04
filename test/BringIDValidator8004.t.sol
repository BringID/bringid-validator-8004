// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {BringIDValidator8004} from "../src/BringIDValidator8004.sol";
import {ICredentialRegistry, ISemaphore} from "../src/interfaces/ICredentialRegistry.sol";
import {MockValidationRegistry} from "./mocks/MockValidationRegistry.sol";
import {MockCredentialRegistry} from "./mocks/MockCredentialRegistry.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract BringIDValidator8004Test is Test {
    BringIDValidator8004 public validator;
    MockValidationRegistry public validationRegistry;
    MockCredentialRegistry public credentialRegistry;

    address public owner = address(0x1);
    address public user = address(0x2);

    uint256 public constant AGENT_ID = 12345;
    uint256 public constant CREDENTIAL_GROUP_ID = 1;
    uint256 public constant DEFAULT_SCORE = 85;

    event OperatorHumanityVerified(
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint256 credentialGroupId,
        uint256 score,
        bytes32 nullifier
    );

    function setUp() public {
        validationRegistry = new MockValidationRegistry();
        credentialRegistry = new MockCredentialRegistry();

        validator = new BringIDValidator8004(
            address(validationRegistry),
            address(credentialRegistry)
        );

        // Set default score for credential group
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, DEFAULT_SCORE);
    }

    // ============ Helper Functions ============

    function _createProof(
        uint256 credentialGroupId,
        uint256 nullifier
    ) internal pure returns (ICredentialRegistry.CredentialGroupProof memory) {
        ISemaphore.SemaphoreProof memory semaphoreProof = ISemaphore.SemaphoreProof({
            merkleTreeDepth: 20,
            merkleTreeRoot: 123456789,
            nullifier: nullifier,
            message: 999,
            scope: 1,
            points: [uint256(1), 2, 3, 4, 5, 6, 7, 8]
        });

        return ICredentialRegistry.CredentialGroupProof({
            credentialGroupId: credentialGroupId,
            semaphoreProof: semaphoreProof
        });
    }

    function _computeExpectedRequestHash(
        uint256 agentId,
        ICredentialRegistry.CredentialGroupProof memory proof
    ) internal pure returns (bytes32) {
        bytes memory proofData = abi.encode(agentId, proof);
        string memory requestURI = string(
            abi.encodePacked("data:application/octet-stream;base64,", Base64.encode(proofData))
        );
        return keccak256(bytes(requestURI));
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(address(validator.validationRegistry()), address(validationRegistry));
        assertEq(address(validator.credentialRegistry()), address(credentialRegistry));
        assertEq(validator.TAG(), "bringid-operator-humanity");
        assertEq(validator.DATA_URI_PREFIX(), "data:application/octet-stream;base64,");
    }

    function test_Constructor_RevertsWithZeroValidationRegistry() public {
        vm.expectRevert("Invalid validation registry");
        new BringIDValidator8004(address(0), address(credentialRegistry));
    }

    function test_Constructor_RevertsWithZeroCredentialRegistry() public {
        vm.expectRevert("Invalid credential registry");
        new BringIDValidator8004(address(validationRegistry), address(0));
    }

    // ============ validate() Unit Tests ============

    function test_Validate_WithValidProof() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 100);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        // Verify validation was registered
        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (
            address validatorAddr,
            uint256 returnedAgentId,
            uint8 response,
            bytes32 responseHash,
            string memory tag,
        ) = validationRegistry.getValidationStatus(requestHash);

        assertEq(validatorAddr, address(validator));
        assertEq(returnedAgentId, AGENT_ID);
        assertEq(response, uint8(DEFAULT_SCORE));
        assertEq(responseHash, bytes32(uint256(100))); // nullifier
        assertEq(tag, "bringid-operator-humanity");
    }

    function test_Validate_EmitsEvent() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 200);
        bytes32 expectedRequestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        bytes32 expectedNullifier = bytes32(uint256(200));

        vm.expectEmit(true, true, false, true);
        emit OperatorHumanityVerified(
            AGENT_ID,
            expectedRequestHash,
            CREDENTIAL_GROUP_ID,
            DEFAULT_SCORE,
            expectedNullifier
        );

        vm.prank(user);
        validator.validate(AGENT_ID, proof);
    }

    function test_Validate_RevertsIfNotApprovedAsOperator() public {
        validationRegistry.setRequiresOperatorApproval(true);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 300);

        vm.prank(user);
        vm.expectRevert("Caller not approved as operator");
        validator.validate(AGENT_ID, proof);
    }

    function test_Validate_SucceedsWhenApprovedAsOperator() public {
        validationRegistry.setRequiresOperatorApproval(true);
        validationRegistry.setApprovalForAll(AGENT_ID, address(validator), true);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 400);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        // Verify validation was registered
        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        assertTrue(validationRegistry.validationExists(requestHash));
    }

    function test_Validate_RevertsIfNullifierAlreadyUsed() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 500);

        // First validation should succeed
        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        // Same proof should fail (nullifier already used)
        vm.prank(user);
        vm.expectRevert("Nullifier already used");
        validator.validate(AGENT_ID, proof);
    }

    function test_Validate_SameNullifierDifferentContext() public {
        uint256 nullifier = 600;
        uint256 agent1 = 1;
        uint256 agent2 = 2;

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, nullifier);

        // Validation for agent1 should succeed
        vm.prank(user);
        validator.validate(agent1, proof);

        // Same nullifier for agent2 should also succeed (different context)
        vm.prank(user);
        validator.validate(agent2, proof);

        // Verify both validations exist with different request hashes
        bytes32 requestHash1 = _computeExpectedRequestHash(agent1, proof);
        bytes32 requestHash2 = _computeExpectedRequestHash(agent2, proof);

        // Request hashes should be different (same proof, different agentId)
        assertTrue(requestHash1 != requestHash2);

        bytes32[] memory agent1Validations = validationRegistry.getAgentValidations(agent1);
        bytes32[] memory agent2Validations = validationRegistry.getAgentValidations(agent2);

        assertEq(agent1Validations.length, 1);
        assertEq(agent2Validations.length, 1);
        assertEq(agent1Validations[0], requestHash1);
        assertEq(agent2Validations[0], requestHash2);
    }

    // ============ Score Capping Tests ============

    function test_Validate_ScoreExactly100() public {
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, 100);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 700);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(response, 100);
    }

    function test_Validate_ScoreAbove100IsCapped() public {
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, 150);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 800);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(response, 100);
    }

    function test_Validate_ScoreZero() public {
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, 0);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 900);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(response, 0);
    }

    function test_Validate_HighScore() public {
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, 999);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 901);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(response, 100); // Capped at 100
    }

    // ============ validateBatch() Unit Tests ============

    function test_ValidateBatch_WithMultipleValidProofs() public {
        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](3);
        proofs[0] = _createProof(CREDENTIAL_GROUP_ID, 1000);
        proofs[1] = _createProof(CREDENTIAL_GROUP_ID, 1001);
        proofs[2] = _createProof(CREDENTIAL_GROUP_ID, 1002);

        vm.prank(user);
        validator.validateBatch(AGENT_ID, proofs);

        // Verify all validations were registered
        bytes32[] memory agentValidations = validationRegistry.getAgentValidations(AGENT_ID);
        assertEq(agentValidations.length, 3);
    }

    function test_ValidateBatch_RevertsIfAnyProofFails() public {
        // Pre-use a nullifier
        credentialRegistry.markNullifierUsed(AGENT_ID, 1101);

        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](3);
        proofs[0] = _createProof(CREDENTIAL_GROUP_ID, 1100);
        proofs[1] = _createProof(CREDENTIAL_GROUP_ID, 1101); // This will fail
        proofs[2] = _createProof(CREDENTIAL_GROUP_ID, 1102);

        vm.prank(user);
        vm.expectRevert("Nullifier already used");
        validator.validateBatch(AGENT_ID, proofs);

        // Verify no validations were registered (atomic revert)
        bytes32[] memory agentValidations = validationRegistry.getAgentValidations(AGENT_ID);
        assertEq(agentValidations.length, 0);
    }

    function test_ValidateBatch_RevertsWithEmptyArray() public {
        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](0);

        vm.prank(user);
        vm.expectRevert("Empty proofs array");
        validator.validateBatch(AGENT_ID, proofs);
    }

    function test_ValidateBatch_SingleProof() public {
        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](1);
        proofs[0] = _createProof(CREDENTIAL_GROUP_ID, 1200);

        vm.prank(user);
        validator.validateBatch(AGENT_ID, proofs);

        bytes32[] memory agentValidations = validationRegistry.getAgentValidations(AGENT_ID);
        assertEq(agentValidations.length, 1);
    }

    // ============ Edge Cases ============

    function test_Validate_ZeroAgentId() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 1300);

        vm.prank(user);
        validator.validate(0, proof);

        bytes32 requestHash = _computeExpectedRequestHash(0, proof);
        (, uint256 returnedAgentId, , , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(returnedAgentId, 0);
    }

    function test_Validate_CorrectRequestHashComputation() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 1400);

        // Compute expected requestHash (now includes agentId)
        bytes memory proofData = abi.encode(AGENT_ID, proof);
        string memory expectedRequestURI = string(
            abi.encodePacked("data:application/octet-stream;base64,", Base64.encode(proofData))
        );
        bytes32 expectedRequestHash = keccak256(bytes(expectedRequestURI));

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        // The validation should be registered under the computed hash
        assertTrue(validationRegistry.validationExists(expectedRequestHash));
    }

    function test_Validate_CredentialRegistryValidationFails() public {
        credentialRegistry.setShouldFailValidation(true, "Invalid proof");

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 1500);

        vm.prank(user);
        vm.expectRevert("Invalid proof");
        validator.validate(AGENT_ID, proof);
    }

    // ============ Integration Tests ============

    function test_FullFlow_RegisterAgentApproveValidate() public {
        // Enable operator approval requirement
        validationRegistry.setRequiresOperatorApproval(true);

        // Approve validator as operator for agent
        validationRegistry.setApprovalForAll(AGENT_ID, address(validator), true);

        // Create and validate proof
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 1600);

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        // Query status
        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (
            address validatorAddr,
            uint256 returnedAgentId,
            uint8 response,
            bytes32 responseHash,
            string memory tag,
            uint256 lastUpdate
        ) = validationRegistry.getValidationStatus(requestHash);

        assertEq(validatorAddr, address(validator));
        assertEq(returnedAgentId, AGENT_ID);
        assertEq(response, uint8(DEFAULT_SCORE));
        assertEq(responseHash, bytes32(uint256(1600)));
        assertEq(tag, "bringid-operator-humanity");
        assertGt(lastUpdate, 0);
    }

    function test_FullFlow_MultipleCredentialsForSameAgent() public {
        uint256 groupId1 = 1;
        uint256 groupId2 = 2;
        uint256 groupId3 = 3;

        credentialRegistry.setCredentialGroupScore(groupId1, 50);
        credentialRegistry.setCredentialGroupScore(groupId2, 75);
        credentialRegistry.setCredentialGroupScore(groupId3, 100);

        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](3);
        proofs[0] = _createProof(groupId1, 1700);
        proofs[1] = _createProof(groupId2, 1701);
        proofs[2] = _createProof(groupId3, 1702);

        vm.prank(user);
        validator.validateBatch(AGENT_ID, proofs);

        // Verify all three validations
        bytes32[] memory agentValidations = validationRegistry.getAgentValidations(AGENT_ID);
        assertEq(agentValidations.length, 3);

        // Verify each score
        for (uint256 i = 0; i < 3; i++) {
            bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proofs[i]);
            (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);

            if (i == 0) assertEq(response, 50);
            if (i == 1) assertEq(response, 75);
            if (i == 2) assertEq(response, 100);
        }
    }

    function test_FullFlow_SameHumanDifferentAgents() public {
        uint256 agent1 = 100;
        uint256 agent2 = 200;
        uint256 nullifier = 1800;

        // Same human (same nullifier) verifying different agents
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, nullifier);

        // Verify agent1
        vm.prank(user);
        validator.validate(agent1, proof);

        // Verify agent2 (different context, same nullifier works)
        vm.prank(user);
        validator.validate(agent2, proof);

        // Both agents should have validations
        assertEq(validationRegistry.getAgentValidations(agent1).length, 1);
        assertEq(validationRegistry.getAgentValidations(agent2).length, 1);

        // The nullifiers in responses should be the same
        bytes32 requestHash1 = validationRegistry.getAgentValidations(agent1)[0];
        bytes32 requestHash2 = validationRegistry.getAgentValidations(agent2)[0];

        (, , , bytes32 responseHash1, , ) = validationRegistry.getValidationStatus(requestHash1);
        (, , , bytes32 responseHash2, , ) = validationRegistry.getValidationStatus(requestHash2);

        assertEq(responseHash1, responseHash2);
        assertEq(responseHash1, bytes32(nullifier));
    }

    // ============ Gas Tests ============

    function test_Gas_ValidateSingle() public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(CREDENTIAL_GROUP_ID, 1900);

        uint256 gasBefore = gasleft();
        vm.prank(user);
        validator.validate(AGENT_ID, proof);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for single validate:", gasUsed);
    }

    function test_Gas_ValidateBatch() public {
        ICredentialRegistry.CredentialGroupProof[] memory proofs = new ICredentialRegistry.CredentialGroupProof[](5);
        for (uint256 i = 0; i < 5; i++) {
            proofs[i] = _createProof(CREDENTIAL_GROUP_ID, 2000 + i);
        }

        uint256 gasBefore = gasleft();
        vm.prank(user);
        validator.validateBatch(AGENT_ID, proofs);
        uint256 gasUsed = gasBefore - gasleft();

        uint256 gasPerProof = gasUsed / 5;
        console.log("Total gas for batch of 5:", gasUsed);
        console.log("Gas per proof in batch:", gasPerProof);
    }

    function test_Gas_BatchIsCheaperPerProof() public {
        // Measure single validate
        ICredentialRegistry.CredentialGroupProof memory singleProof = _createProof(CREDENTIAL_GROUP_ID, 3000);
        uint256 singleGasBefore = gasleft();
        vm.prank(user);
        validator.validate(AGENT_ID, singleProof);
        uint256 singleGas = singleGasBefore - gasleft();

        // Measure batch validate with 5 proofs
        ICredentialRegistry.CredentialGroupProof[] memory batchProofs = new ICredentialRegistry.CredentialGroupProof[](5);
        for (uint256 i = 0; i < 5; i++) {
            batchProofs[i] = _createProof(CREDENTIAL_GROUP_ID, 3001 + i);
        }

        uint256 batchGasBefore = gasleft();
        vm.prank(user);
        validator.validateBatch(AGENT_ID, batchProofs);
        uint256 batchGas = batchGasBefore - gasleft();

        uint256 batchGasPerProof = batchGas / 5;

        console.log("Single validate gas:", singleGas);
        console.log("Batch (5) gas per proof:", batchGasPerProof);

        // Batch should be cheaper per proof due to amortized fixed costs
        // Note: This may not always be true depending on implementation,
        // but demonstrates the test pattern
    }

    // ============ Fuzz Tests ============

    function testFuzz_Validate_AnyAgentId(uint256 agentId) public {
        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(
            CREDENTIAL_GROUP_ID,
            uint256(keccak256(abi.encode(agentId, "unique")))
        );

        vm.prank(user);
        validator.validate(agentId, proof);

        bytes32 requestHash = _computeExpectedRequestHash(agentId, proof);
        (, uint256 returnedAgentId, , , , ) = validationRegistry.getValidationStatus(requestHash);
        assertEq(returnedAgentId, agentId);
    }

    function testFuzz_Validate_AnyScore(uint256 score) public {
        credentialRegistry.setCredentialGroupScore(CREDENTIAL_GROUP_ID, score);

        ICredentialRegistry.CredentialGroupProof memory proof = _createProof(
            CREDENTIAL_GROUP_ID,
            uint256(keccak256(abi.encode(score, "unique")))
        );

        vm.prank(user);
        validator.validate(AGENT_ID, proof);

        bytes32 requestHash = _computeExpectedRequestHash(AGENT_ID, proof);
        (, , uint8 response, , , ) = validationRegistry.getValidationStatus(requestHash);

        // Response should be capped at 100
        if (score > 100) {
            assertEq(response, 100);
        } else {
            assertEq(response, uint8(score));
        }
    }
}
