// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BringIDValidator8004} from "../src/BringIDValidator8004.sol";
import {MockValidationRegistry} from "../test/mocks/MockValidationRegistry.sol";

/// @title Deploy
/// @notice Deployment script for BringIDValidator8004 (requires existing ValidationRegistry)
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address validationRegistry = vm.envAddress("VALIDATION_REGISTRY");
        address credentialRegistry = vm.envAddress("CREDENTIAL_REGISTRY");

        console.log("Deploying BringIDValidator8004...");
        console.log("Validation Registry:", validationRegistry);
        console.log("Credential Registry:", credentialRegistry);

        vm.startBroadcast(deployerPrivateKey);

        BringIDValidator8004 validator = new BringIDValidator8004(
            validationRegistry,
            credentialRegistry
        );

        console.log("BringIDValidator8004 deployed at:", address(validator));

        vm.stopBroadcast();
    }
}

/// @title DeployBaseSepolia
/// @notice Deployment script for Base Sepolia testnet - deploys ValidationRegistry + BringIDValidator8004
contract DeployBaseSepolia is Script {
    // Base Sepolia BringID Credential Registry
    address constant CREDENTIAL_REGISTRY = 0x0b2Ab187a6FD2d2F05fACc158611838c284E3a9c;
    // Base Sepolia EIP-8004 Identity Registry
    address constant IDENTITY_REGISTRY = 0x8004A818BFB912233c491871b3d84c89A494BD9e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Deploying to Base Sepolia ===");
        console.log("Identity Registry:", IDENTITY_REGISTRY);
        console.log("Credential Registry:", CREDENTIAL_REGISTRY);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ValidationRegistry
        console.log("\n1. Deploying ValidationRegistry...");
        MockValidationRegistry validationRegistry = new MockValidationRegistry();
        console.log("ValidationRegistry deployed at:", address(validationRegistry));

        // 2. Deploy BringIDValidator8004
        console.log("\n2. Deploying BringIDValidator8004...");
        BringIDValidator8004 validator = new BringIDValidator8004(
            address(validationRegistry),
            CREDENTIAL_REGISTRY
        );
        console.log("BringIDValidator8004 deployed at:", address(validator));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("ValidationRegistry:", address(validationRegistry));
        console.log("BringIDValidator8004:", address(validator));
        console.log("\nNext steps:");
        console.log("1. Update SKILL.md with contract addresses");
        console.log("2. Operators must call setApprovalForAll(validator, true) on Identity Registry");
    }
}
