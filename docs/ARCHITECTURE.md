# ReliefTrail: System Design

## Purpose

ReliefTrail is an early EVM prototype for recording donations and organizer-authorized relief payouts in a publicly inspectable ledger. It demonstrates transaction rules and event logging. It does not verify that an organization is legitimate, that a receipt is truthful, or that aid reached a recipient.

## Components

- **Donor wallets** send native currency to `donate()`.
- **ReliefTrail contract** tracks donations and payouts, checks authorization and balance, and emits events.
- **Organizer wallet** is set to the deploying account and is the only account allowed to call `payRelief(...)`.
- **Recipient wallet** receives the requested payout.
- **Off-chain evidence storage** holds any receipt or supporting file. The contract stores only a `bytes32` fingerprint supplied by the caller.

## Transaction flow

1. A donor sends a nonzero payment to `donate()`.
2. The contract increments the donated total and count, then emits `DonationReceived`.
3. The organizer calls `payRelief(recipient, amount, purpose, evidenceHash)`.
4. The contract checks the caller, recipient, amount, available balance, and evidence hash.
5. The contract transfers the amount and emits `ReliefPaid`.

The payout purpose and evidence fingerprint are public. Do not place personal, confidential, or identifying information in them.

## Contract rules

| Function or state | Behavior |
|---|---|
| `reliefOrganizer` | Immutable address of the account that deployed this contract. |
| `donate()` | Accepts a nonzero amount of native currency and records the donation. |
| `payRelief(...)` | Organizer-only transfer; rejects invalid recipient, zero or over-balance amount, and empty evidence hash. |
| `availableBalance()` | Returns the current contract balance. |
| `DonationReceived` | Event containing donor, amount, and new contract balance. |
| `ReliefPaid` | Event containing recipient, amount, purpose, and evidence fingerprint. |

The payout applies its checks and updates accounting before the external transfer. A failed transfer reverts the whole transaction. This prototype does not include multi-signature approvals or independent evidence review.

## Local demonstration

The source is `contracts/ReliefTrail.sol`. Compile it in Remix with Solidity 0.8.24 or a compatible 0.8.x compiler, then deploy to **Remix VM**. Remix VM uses temporary test accounts and simulated ETH.

The sample run records two donations totaling 1.5 ETH, followed by a 0.4 ETH payout. The contract retains 1.1 ETH. See the [Remix screenshot](../screenshots/relieftrail-remix-demo.jpg) and the run steps in the root README. Remix VM addresses are temporary and change after a reset.

## Trust boundaries and limitations

- Blockchain records make submitted transactions and events inspectable; they do not establish the truth of off-chain claims.
- A hash can establish that a later file matches the fingerprint that was recorded. It cannot prove when, where, or by whom the file was created.
- The deploying account has sole payout authority. A compromised or dishonest organizer can misuse that authority.
- A real deployment would need independent governance, operational controls, privacy safeguards, security review, and a trusted organization responsible for verifying evidence.
- This repository contains no public-network deployment and makes no production-readiness claim.
