import type { Address, Hex, PublicClient } from "viem";
import { ValidationRegistryAbi } from "./abi.js";
import type {
  AgentScoreResult,
  BringIDValidation,
  GetAgentScoreOptions,
  ValidationDetails,
  Validator8004ClientConfig,
} from "./types.js";

/** Tag used by BringID validator for operator humanity verification */
export const BRINGID_TAG = "bringid-operator-humanity";

/**
 * Client for querying BringID validations from EIP-8004 Validation Registry
 */
export class Validator8004Client {
  private readonly client: PublicClient;
  private readonly validationRegistry: Address;
  private readonly bringIdValidator: Address;

  /**
   * Creates a new Validator8004Client
   * @param client - viem PublicClient for blockchain queries
   * @param config - Configuration with contract addresses
   */
  constructor(client: PublicClient, config: Validator8004ClientConfig) {
    this.client = client;
    this.validationRegistry = config.validationRegistry;
    this.bringIdValidator = config.bringIdValidator;
  }

  /**
   * Get the total BringID score and nullifiers for an agent
   * @param agentId - The EIP-8004 agent ID
   * @param options - Optional filters (maxAge)
   * @returns AgentScoreResult with totalScore, nullifiers, and individual validations
   */
  async getAgentScore(
    agentId: bigint,
    options?: GetAgentScoreOptions
  ): Promise<AgentScoreResult> {
    // Get all validation request hashes for this agent
    const requestHashes = await this.client.readContract({
      address: this.validationRegistry,
      abi: ValidationRegistryAbi,
      functionName: "getAgentValidations",
      args: [agentId],
    });

    let totalScore = 0;
    const nullifiers: Hex[] = [];
    const validations: BringIDValidation[] = [];

    const now = BigInt(Math.floor(Date.now() / 1000));

    for (const requestHash of requestHashes) {
      const details = await this.getValidationDetails(requestHash);

      // Filter for BringID validations only
      if (
        details.validator.toLowerCase() !==
          this.bringIdValidator.toLowerCase() ||
        details.tag !== BRINGID_TAG
      ) {
        continue;
      }

      // Apply max age filter if specified
      if (options?.maxAge !== undefined) {
        const age = now - details.lastUpdate;
        if (age > options.maxAge) {
          continue;
        }
      }

      totalScore += details.response;
      nullifiers.push(details.responseHash);
      validations.push({
        requestHash,
        score: details.response,
        nullifier: details.responseHash,
        lastUpdate: details.lastUpdate,
      });
    }

    return { totalScore, nullifiers, validations };
  }

  /**
   * Get validation details for a specific request hash
   * @param requestHash - The validation request hash
   * @returns ValidationDetails
   */
  async getValidationDetails(requestHash: Hex): Promise<ValidationDetails> {
    const result = await this.client.readContract({
      address: this.validationRegistry,
      abi: ValidationRegistryAbi,
      functionName: "getValidationStatus",
      args: [requestHash],
    });

    return {
      validator: result[0],
      agentId: result[1],
      response: result[2],
      responseHash: result[3],
      tag: result[4],
      lastUpdate: result[5],
    };
  }

  /**
   * Check if a nullifier has been used for a specific agent
   * @param agentId - The EIP-8004 agent ID
   * @param nullifier - The nullifier to check
   * @returns true if the nullifier is associated with this agent
   */
  async hasNullifier(agentId: bigint, nullifier: Hex): Promise<boolean> {
    const result = await this.getAgentScore(agentId);
    return result.nullifiers.some(
      (n) => n.toLowerCase() === nullifier.toLowerCase()
    );
  }

}
