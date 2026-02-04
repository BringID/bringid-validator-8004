// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BringIDValidator8004} from "../src/BringIDValidator8004.sol";

/// @title Deploy
/// @notice Deployment script for BringIDValidator8004
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

/// @title DeployLocal
/// @notice Deployment script for local testing with mock contracts
contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy mock contracts for local testing
        // In production, these would be the actual registry addresses

        console.log("Deploying mock registries for local testing...");

        // Note: Deploy mocks separately or use actual addresses
        address validationRegistry = vm.envOr("VALIDATION_REGISTRY", address(0));
        address credentialRegistry = vm.envOr("CREDENTIAL_REGISTRY", address(0));

        require(validationRegistry != address(0), "VALIDATION_REGISTRY not set");
        require(credentialRegistry != address(0), "CREDENTIAL_REGISTRY not set");

        BringIDValidator8004 validator = new BringIDValidator8004(
            validationRegistry,
            credentialRegistry
        );

        console.log("BringIDValidator8004 deployed at:", address(validator));

        vm.stopBroadcast();
    }
}
