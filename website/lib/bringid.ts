// BringID SDK types (snake_case as returned by SDK)
export interface SemaphoreProofSDK {
  credential_group_id: string;
  semaphore_proof: {
    merkle_tree_depth: number;
    merkle_tree_root: string;
    nullifier: string;
    message: string;
    scope: string;
    points: string[];
  };
}

// Contract-compatible types (for on-chain submission)
export interface ContractProof {
  credentialGroupId: bigint;
  semaphoreProof: {
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
  };
}

export function mapProofToContract(proof: SemaphoreProofSDK): ContractProof {
  return {
    credentialGroupId: BigInt(proof.credential_group_id),
    semaphoreProof: {
      merkleTreeDepth: BigInt(proof.semaphore_proof.merkle_tree_depth),
      merkleTreeRoot: BigInt(proof.semaphore_proof.merkle_tree_root),
      nullifier: BigInt(proof.semaphore_proof.nullifier),
      message: BigInt(proof.semaphore_proof.message),
      scope: BigInt(proof.semaphore_proof.scope),
      points: proof.semaphore_proof.points.map((p) => BigInt(p)) as unknown as readonly [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ],
    },
  };
}

export function mapProofsToContract(proofs: SemaphoreProofSDK[]): ContractProof[] {
  return proofs.map(mapProofToContract);
}
