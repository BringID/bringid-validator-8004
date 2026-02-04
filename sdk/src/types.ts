import type { Address, Hex } from "viem";

/**
 * Semaphore proof structure
 */
export interface SemaphoreProof {
  merkleTreeDepth: bigint;
  merkleTreeRoot: bigint;
  nullifier: bigint;
  message: bigint;
  scope: bigint;
  points: readonly [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint
  ];
}

/**
 * BringID credential group proof
 */
export interface CredentialGroupProof {
  credentialGroupId: bigint;
  semaphoreProof: SemaphoreProof;
}

/**
 * Validation details from EIP-8004 registry
 */
export interface ValidationDetails {
  validator: Address;
  agentId: bigint;
  response: number;
  responseHash: Hex;
  tag: string;
  lastUpdate: bigint;
}

/**
 * BringID validation with extracted details
 */
export interface BringIDValidation {
  requestHash: Hex;
  score: number;
  nullifier: Hex;
  lastUpdate: bigint;
}

/**
 * Result of getAgentScore
 */
export interface AgentScoreResult {
  /** Total score summed from all BringID validations */
  totalScore: number;
  /** List of nullifiers for Sybil tracking */
  nullifiers: Hex[];
  /** Individual validations */
  validations: BringIDValidation[];
}

/**
 * Options for filtering validations
 */
export interface GetAgentScoreOptions {
  /** Maximum age of validations in seconds (optional) */
  maxAge?: bigint;
}

/**
 * Configuration for the Validator8004Client
 */
export interface Validator8004ClientConfig {
  /** Address of the EIP-8004 Validation Registry */
  validationRegistry: Address;
  /** Address of the BringID Validator contract */
  bringIdValidator: Address;
}
