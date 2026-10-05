# ReliefTrail — Transparent Disaster Relief Fund Tracking

ReliefTrail is a Solidity prototype for transparent disaster-relief fund tracking. It explores whether on-chain records can make donations and organizer-approved payouts easier to audit. A payout also records a cryptographic fingerprint that can be compared with a receipt kept off-chain.

This is an early-stage prototype. A receipt fingerprint does not prove that a receipt is genuine or that aid reached anyone. A real system would need trusted organizations, independent review, privacy controls, delivery confirmation, and shared payout approval.

## What it demonstrates

- `donate()` accepts native currency and logs the donor and amount.
- `payRelief(...)` lets only the deploying organizer send a payout.
- Payouts above the available balance, zero amounts, zero recipient addresses, and missing evidence fingerprints are rejected.
- Totals, counts, available balance, and transaction events can be inspected.

## Tools

- Solidity `^0.8.24`
- Remix IDE
- Remix VM (local test blockchain; no real ETH)

## Files

```text
contracts/ReliefTrail.sol       Smart contract source
README.md                       Project and run instructions
docs/PROJECT_REPORT.pdf         Submission report
docs/PROJECT_REPORT.md          Editable report source
screenshots/README.md           Screenshot capture checklist
LICENSE                         MIT license
```

## Compile and run in Remix

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create `ReliefTrail.sol` and paste the source from `contracts/ReliefTrail.sol`.
3. Choose compiler 0.8.24 or compatible 0.8.x and compile.
4. Under **Deploy & Run Transactions**, select **Remix VM** and deploy. The deploying account becomes `reliefOrganizer`.
5. Select another account, set transaction VALUE to `1 Ether`, and call `donate()`. Repeat with a third account and `0.5 Ether`.
6. Confirm `totalDonated` is `1500000000000000000` wei and `donationCount` is 2.
7. Select the deploying account and call `payRelief` with a recipient account address, amount `400000000000000000` wei, purpose `emergency food kits`, and a nonzero 32-byte fingerprint such as `0x1111111111111111111111111111111111111111111111111111111111111111`.
8. Confirm `totalPaidOut` is `400000000000000000` wei, `payoutCount` is 1, and `availableBalance` is `1100000000000000000` wei (1.1 ETH).
9. Select a non-organizer account and try the payout again. It should revert with `OrganizerOnly`.

## Demo run and deployment

The contract compiled and ran in Remix VM (Osaka). The demonstration recorded two donations totalling 1.5 ETH, a 0.4 ETH payout, and a remaining balance of 1.1 ETH. A payout from a non-organizer account reverted with `OrganizerOnly`.

Remix VM contract address during that session: `0xd9145CCE52D386f254917e481eB44e9943F39138`. This is a temporary local address; it is not deployed to a public testnet or mainnet and may not persist after Remix resets.

## Demo screenshots

Capture screenshots of (1) the compiled contract, (2) deployed contract and address, (3) successful donation transactions, (4) successful payout and `ReliefPaid` event, (5) displayed totals/balance, and (6) the rejected non-organizer payout. Save them under `screenshots/`. The current repository includes a checklist; the images still need to be captured from the Remix session before final submission.

## Evidence hash and privacy

For a real workflow, keep evidence files in secure off-chain storage and record only a Keccak-256 fingerprint on-chain. A matching hash can show that a file matches a fingerprint already recorded; it cannot validate the truth of that file. Do not publish private documents or personal data to a public blockchain.

## Future development path

1. Add multi-signature approval so one organizer cannot authorize payouts alone.
2. Add recipient delivery acknowledgement and independently reviewed evidence.
3. Build a basic Python web page to display blockchain events.
4. Add QR-based verification while keeping personal data off-chain.
5. Consider a real pilot only with a partner organization, privacy review, security review, and test data.

## License

MIT. See `LICENSE`.
