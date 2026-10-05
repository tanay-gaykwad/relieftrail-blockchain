# ReliefTrail — Transparent Disaster Relief Fund Tracking
## Project Report

## 1. Introduction
Disaster response depends on timely support, but donors and communities can have limited visibility into how relief funds move. ReliefTrail is an EVM smart-contract prototype that records donations and payouts, and attaches a public cryptographic fingerprint to each payout. The fingerprint can be compared with an off-chain receipt or evidence file.

## 2. Problem Statement
Relief transactions may be recorded in private systems that outside observers cannot independently inspect. ReliefTrail demonstrates an append-only, shared transaction record with simple contract rules. It improves visibility into recorded payments but cannot verify a recipient's identity or prove that aid was delivered.

## 3. Objectives
- Accept donations and emit public donor/amount transaction events.
- Restrict payouts to the account that deployed the contract.
- Reject zero-value and over-balance payouts.
- Link each payout to an evidence file using a cryptographic fingerprint.
- Demonstrate deployment, contract state, events, and failed authorization in a local EVM.

## 4. Blockchain Platform and Tools
- Smart-contract language: Solidity 0.8.x (`^0.8.24`).
- Development environment: Remix IDE.
- Execution environment: Remix VM, a temporary local EVM with test accounts.
- Native currency: ETH in the example; amounts are represented in wei.

No public testnet or mainnet deployment is included. Remix VM account balances are for demonstration only.

## 5. System Architecture
```text
Donor accounts -- donate(value) --> ReliefTrail contract -- DonationReceived event --> Public ledger
Organizer -- payRelief(recipient, amount, purpose, evidenceHash) --> Recipient account
                                         | checks organizer, amount, hash
                                         +-- ReliefPaid event + evidence fingerprint
Evidence document -- stored off-chain; its hash is recorded on-chain
```
The blockchain stores transactions and evidence fingerprints. The evidence file itself stays off-chain because putting receipts or personal data on a public chain would create privacy risks.

## 6. Smart Contract Design
Source file: `contracts/ReliefTrail.sol`.

| Element | Purpose |
|---|---|
| `reliefOrganizer` | Immutable address of the deployer, allowed to pay out. |
| `donate()` | Receives a nonzero payment and updates donation totals and count. |
| `payRelief(...)` | Organizer-only payment; checks recipient, amount, balance, and nonzero evidence fingerprint. |
| `availableBalance()` | Returns funds currently held by the contract. |
| `DonationReceived` | Logs donor, amount, and resulting balance. |
| `ReliefPaid` | Logs recipient, amount, purpose, and evidence fingerprint. |

The payout updates counters before transferring funds. If the transfer fails, the entire transaction reverts. The purpose and fingerprint are public. The contract is an early-stage prototype and has no independent evidence review or multi-signature governance.

## 7. Demonstration Procedure and Expected Outputs
In Remix, deploy to Remix VM. Donate 1 ETH from one test account and 0.5 ETH from another. From the deployer, pay 0.4 ETH (400000000000000000 wei) to a third test account. Include a nonzero 32-byte demo fingerprint in `payRelief`.

| Check after sample transactions | Expected output |
|---|---:|
| `totalDonated()` | 1500000000000000000 wei (1.5 ETH) |
| `donationCount()` | 2 |
| `totalPaidOut()` | 400000000000000000 wei (0.4 ETH) |
| `payoutCount()` | 1 |
| `availableBalance()` | 1100000000000000000 wei (1.1 ETH) |
| Payout from non-organizer | Reverts with `OrganizerOnly` |
| Payout above available funds | Reverts with `InvalidPayoutAmount` |
| Payout with zero evidence hash | Reverts with `MissingEvidenceHash` |

Live demonstration completed in Remix VM (Osaka). Deployed contract address: `0xd9145CCE52D386f254917e481eB44e9943F39138`. The displayed state matched these values: 1.5 ETH donated across two donor accounts, 0.4 ETH paid out, 1.1 ETH remaining, donation count 2, and payout count 1. A non-organizer payout reverted with `OrganizerOnly`. The local Remix VM is temporary; this address is not a public network deployment. Capture screenshots from your own Remix session before sharing or submitting.

## 8. Conclusion
ReliefTrail demonstrates donations, an organizer rule, balance checks, transaction events, and evidence fingerprinting. It makes recorded fund movements easier to inspect. A matching hash can link a receipt file to a payment record, but it cannot establish that the receipt is genuine or that aid reached people.

## 9. Future Scope: Toward a Real Pilot
A future version could require multiple independent approvals, add recipient delivery acknowledgements, and provide a QR-based verification page. Receipts should remain encrypted off-chain, with only their fingerprints on-chain. Any real pilot should begin with a community or NGO partner, fictional/test data, independent security review, and appropriate legal and privacy safeguards.

## References
- Solidity documentation: https://docs.soliditylang.org/
- Remix IDE: https://remix.ethereum.org/
- Ethereum developer documentation: https://ethereum.org/developers/docs/



