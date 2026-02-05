# BringID × EIP-8004 Verification Flow

## Actors

- **User** — human who owns an EIP-8004 agent (holds the NFT)
- **Agent** — AI agent registered via EIP-8004 on Base
- **Website** — `8004.bringid.org` (landing page + verification page)
- **Contracts** — BringIDValidator8004, ValidationRegistry, IdentityRegistry (on Base)

---

## Prerequisites

- User has an EIP-8004 agent registered on Base (owns the agent NFT, knows their `agentId`)
- User has a wallet (the same wallet that owns the agent)
- BringIDValidator8004 contract is deployed on Base

---

## Flow

### Phase 1: Discovery

```
User ──────────────────────────────────────────────── Agent
  │                                                     │
  │  Option A: User visits 8004.bringid.org             │
  │  ┌─────────────────────────────────┐                │
  │  │ Landing page explains:          │                │
  │  │ • What BringID verification is  │                │
  │  │ • Copy skill.md                 │                │
  │  │ • Paste it to your agent        │                │
  │  └─────────────────────────────────┘                │
  │                                                     │
  │  "Here's the skill.md, please register"             │
  │ ──────────────────────────────────────────────────▶ │
  │                                                     │
  │  Option B: User already has skill.md                │
  │  (shared by another user, found in docs, etc.)      │
  │                                                     │
  │  "I want to verify my agent's humanity"             │
  │ ──────────────────────────────────────────────────▶ │
  │                                                     │
```

### Phase 2: Agent Orchestration

```
                                                        Agent
                                                          │
                                                          │  Reads skill.md
                                                          │  Understands the protocol
                                                          │
                                                          │  Needs: agentId
                                                          │
                                              ┌───────────┴───────────┐
                                              │ Does agent know       │
                                              │ its own agentId?      │
                                              └───────────┬───────────┘
                                                    │           │
                                                   Yes          No
                                                    │           │
                                                    │     Agent asks user:
                                                    │     "What is your agentId?"
                                                    │           │
                                                    │     User provides agentId
                                                    │           │
                                              ┌─────▼───────────▼─────┐
                                              │ Agent constructs URL: │
                                              │ https://8004.bringid. │
                                              │ org/verify?agentId=42 │
                                              └───────────┬───────────┘
                                                          │
```

### Phase 3: Agent Sends User to Verify

```
User ◀──────────────────────────────────────────────── Agent
  │                                                     │
  │  "To verify your humanity, go to:                   │
  │   https://8004.bringid.org/verify?agentId=42        │
  │                                                     │
  │   You'll need to:                                   │
  │   1. Connect the wallet that owns this agent        │
  │   2. Approve the BringID validator (one-time)       │
  │   3. Verify your credentials through BringID        │
  │   4. Submit proofs on-chain                         │
  │                                                     │
  │   Come back when you're done."                      │
  │                                                     │
```

### Phase 4: Verification Website

User is now on `8004.bringid.org/verify?agentId=42`

```
User                            Website                         Contracts
 │                                 │                                │
 │  4a. Connect Wallet             │                                │
 │ ──────────────────────────────▶ │                                │
 │                                 │                                │
 │                                 │  4b. Verify ownership          │
 │                                 │  ownerOf(agentId)              │
 │                                 │ ─────────────────────────────▶ │
 │                                 │ ◀───────────── owner address ─ │
 │                                 │                                │
 │                                 │  Compare: owner == connected   │
 │                                 │  wallet?                       │
 │                                 │                                │
 │              ┌──────────────────┴──────────────────┐             │
 │              │ NO: "You don't own this agent.      │             │
 │              │  Connect the correct wallet."       │             │
 │              └──────────────────┬──────────────────┘             │
 │                                 │                                │
 │              ┌──────────────────┴──────────────────┐             │
 │              │ YES: Continue                       │             │
 │              └──────────────────┬──────────────────┘             │
 │                                 │                                │
 │                                 │  4c. Check operator approval   │
 │                                 │  isApprovedForAll(             │
 │                                 │    owner, validatorAddress)    │
 │                                 │ ─────────────────────────────▶ │
 │                                 │ ◀──────────── true / false ── │
 │                                 │                                │
 │              ┌──────────────────┴──────────────────┐             │
 │              │ NOT APPROVED:                       │             │
 │              │ "Approve BringID Validator           │             │
 │              │  as operator (one-time)"            │             │
 │              └──────────────────┬──────────────────┘             │
 │                                 │                                │
 │  4d. Sign approval tx           │                                │
 │  (if needed)                    │  setApprovalForAll(            │
 │ ──────────────────────────────▶ │    validator, true)            │
 │                                 │ ─────────────────────────────▶ │
 │                                 │ ◀──────────────────── tx ✓ ── │
 │                                 │                                │
 │              ┌──────────────────┴──────────────────┐             │
 │              │ APPROVED: Continue                   │             │
 │              └──────────────────┬──────────────────┘             │
 │                                 │                                │
 │  4e. BringID Verification       │                                │
 │                                 │                                │
 │  BringID modal opens            │                                │
 │  scope = agentId (critical:     │                                │
 │  binds proofs to this agent)    │                                │
 │                                 │                                │
 │  User verifies credentials:     │                                │
 │  • OAuth: X, GitHub, Farcaster  │                                │
 │  • MPC-TLS: Binance, Apple      │                                │
 │  • Identity: zkPassport, Self   │                                │
 │                                 │                                │
 │  Returns: { proofs, points }    │                                │
 │                                 │                                │
 │  4f. Submit proofs on-chain     │                                │
 │                                 │  validateBatch(                │
 │  Sign transaction               │    agentId, proofs)            │
 │ ──────────────────────────────▶ │ ─────────────────────────────▶ │
 │                                 │                                │
 │                                 │  For each proof, atomically:   │
 │                                 │  1. Verify semaphoreProof      │
 │                                 │     .message == agentId        │
 │                                 │  2. validateProof(0, proof)    │
 │                                 │  3. Get credential score       │
 │                                 │  4. validationRequest()        │
 │                                 │  5. validationResponse()       │
 │                                 │     (score + nullifier)        │
 │                                 │                                │
 │                                 │ ◀──────────────────── tx ✓ ── │
 │                                 │                                │
 │  4g. Success screen             │                                │
 │  "✅ Verified! Score: 75"       │                                │
 │  "Go back to your agent"        │                                │
 │ ◀────────────────────────────── │                                │
 │                                 │                                │
```

### Phase 5: User Returns to Agent

```
User ──────────────────────────────────────────────── Agent
  │                                                     │
  │  "Done, I've verified."                             │
  │ ──────────────────────────────────────────────────▶ │
  │                                                     │
  │                                                     │  Query on-chain:
  │                                                     │  getAgentScore(agentId)
  │                                                     │
  │                                         ┌───────────┴───────────┐
  │                                         │ totalScore > 0 ?      │
  │                                         └───────────┬───────────┘
  │                                               │           │
  │                                              Yes          No
  │                                               │           │
  │                                               │     "I can't find your
  │                                               │      verification yet.
  │                                               │      Make sure you
  │                                               │      completed all steps.
  │                                               │      The tx may still be
  │                                               │      confirming."
  │                                               │
  │  "✅ Your humanity is verified!                │
  │   Score: 75. Other agents and apps             │
  │   can now see this on-chain."                  │
  │ ◀──────────────────────────────────────────── │
  │                                                │
  │                                                │  Agent updates its
  │                                                │  registration file:
  │                                                │  supportedTrust:
  │                                                │    ["bringid-operator-
  │                                                │     humanity"]
  │                                                │
```

---

## Error Cases

### User connects wrong wallet
```
Website: "The connected wallet (0xABC...) does not own agent #42.
          The owner is 0xDEF.... Please switch wallets."
```

### Credential already used for another agent
```
On-chain: validateProof() reverts — nullifier already consumed.
Website: "This credential has already been used to verify a
          different agent. Each credential can only be linked
          to one agent."
```

### Proof frontrunning attempt
```
On-chain: require(proof.semaphoreProof.message == agentId) fails.
          Proof was generated for a different agentId.
```

### Agent queries before tx confirms
```
Agent: getAgentScore() returns 0.
Agent: "I can't find your verification yet. The transaction may
        still be confirming — try again in a minute."
```

### Operator approval not granted
```
On-chain: validationRequest() reverts — validator not approved.
Website: Should always prompt for approval first, but if
         skipped, the submit tx will fail. Website catches
         this and prompts approval.
```

---

## Sequence Summary

```
1.  User         →  discovers skill.md (via landing page or shared link)
2.  User         →  sends skill.md to agent
3.  Agent        →  reads skill.md, asks for agentId if needed
4.  Agent        →  constructs verification URL
5.  Agent        →  sends user to 8004.bringid.org/verify?agentId=X
6.  User         →  connects wallet on verification page
7.  Website      →  checks wallet owns the agent (ownerOf)
8.  Website      →  checks/prompts operator approval (setApprovalForAll)
9.  User         →  signs approval tx (one-time)
10. Website      →  opens BringID modal (scope = agentId)
11. User         →  verifies credentials through BringID
12. Website      →  receives proofs from BringID
13. Website      →  calls validateBatch(agentId, proofs)
14. User         →  signs the submission tx
15. Contracts    →  validates proofs, records scores + nullifiers
16. Website      →  shows success screen
17. User         →  returns to agent, says "done"
18. Agent        →  queries getAgentScore(agentId) on-chain
19. Agent        →  confirms verification, reports score to user
20. Agent        →  adds "bringid-operator-humanity" to supportedTrust
```
