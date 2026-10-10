# ReliefTrail Blockchain

ReliefTrail Blockchain is a Solidity prototype for recording native-token donations and organizer-authorized relief payouts. The contract exposes balances and emits events that can be independently inspected on an EVM network.

This is a focused smart-contract portfolio project. It is not a donation service, escrow for real aid, proof of delivery, or audited financial product. Its deployer has sole payout authority, and submitted evidence fingerprints do not prove that evidence is authentic.

## Problem and design intent

When a relief payment is represented on a public chain, donors and reviewers can inspect the transaction and emitted event history. The contract demonstrates how authorization, amount limits, and state updates can be enforced at the contract boundary. It does not validate an organization, recipient, or off-chain receipt.

The separate [ResponseHub project](https://github.com/tanay-gaykwad/relieftrail-response-hub) models relational grant operations. The two repositories share a product story but are not connected in software.

## Contract behavior

- Any account may call `donate()` with a nonzero amount of native currency.
- The contract tracks total donations, total payouts, counts, and current balance.
- Only the account that deployed the contract may call `payRelief(...)`.
- Payouts reject a zero recipient, zero or over-balance amount, empty evidence hash, and empty or oversized public purpose.
- A failed recipient transfer reverts the whole transaction, including the accounting updates.
- `DonationReceived` and `ReliefPaid` events expose the submitted transaction details.

The recipient and purpose are public. Never put names, addresses, medical details, case IDs, or confidential information in a transaction. The evidence hash should be computed off-chain from a file that is itself safe to disclose; hashing does not make the underlying claim true.

## Technology and architecture

- Solidity 0.8.24
- Hardhat 2, ethers 6, and Chai matchers
- Sepolia deployment configuration is opt-in via local environment variables
- Docker Compose can run an isolated local Hardhat JSON-RPC node

The test suite deploys a fresh contract for each case and exercises state changes, emitted events, authorization failures, invalid input, balance tracking, and transfer failure. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the flow and trust boundaries.

## Local setup

Requirements: Node.js 20+, Corepack/pnpm, and optionally Docker Desktop.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm compile
pnpm test
```

To run a local JSON-RPC development node with Docker:

```bash
docker compose up --build
```

The node binds to `127.0.0.1:8545` and creates temporary, well-known development accounts. Never send real assets to it or reuse its keys elsewhere.

## Demo walkthrough

1. Run `pnpm test` to see the contract and test cases execute against Hardhat's local network.
2. In Remix, select **Remix VM**, compile `contracts/ReliefTrail.sol` with Solidity 0.8.24, and deploy. The deploying account becomes the organizer.
3. From another temporary Remix account, send 1 ETH to `donate()`.
4. From the deploying account, call `payRelief` with a recipient address, a smaller amount, a short public purpose, and a nonzero 32-byte fingerprint.
5. Inspect the event, `totalDonated`, `totalPaidOut`, `payoutCount`, and `availableBalance`.
6. Try `payRelief` from another account and confirm the organizer-only check rejects it.

The repository screenshot shows a Remix VM run using simulated ETH. It is not a public-chain transaction.

## Security and quality

[`SECURITY.md`](SECURITY.md) describes the enforced rules, trust boundaries, and outstanding risks. CI runs Solhint, Hardhat compilation, and the contract suite. These checks catch regressions in implemented behavior; they do not prove the absence of vulnerabilities or replace an independent audit.

## Sepolia deployment

The repository includes an opt-in deployment script, but **no public testnet deployment is currently verified**. Do not paste private keys into chat or commit them.

1. Create a dedicated test wallet with no real funds and obtain a Sepolia RPC URL from a provider.
2. Copy `.env.example` to `.env` and set `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` locally.
3. Fund the test wallet with Sepolia test ETH from a faucet.
4. Run `pnpm deploy:sepolia`. The script refuses to deploy unless the provider reports Sepolia chain ID `11155111`.
5. Independently inspect the transaction and contract address on a Sepolia block explorer. Add a verified address/link here only after deployment and source verification succeed.

Do not use a mainnet wallet or real funds. The deployment script is not a security review.

## Screenshots

![ReliefTrail contract demonstration in Remix VM](screenshots/relieftrail-remix-demo.jpg)

This is an illustrative local Remix VM walkthrough. See [`screenshots/README.md`](screenshots/README.md) for context.

## What this project demonstrates

- Solidity state and payable function design
- Access restrictions enforced by the contract, not by a frontend
- Revert-based invalid-input handling and atomic rollback
- Events for public transaction inspection
- Automated contract tests for success and failure cases
- Honest separation of on-chain facts from off-chain claims

## What I learned

Contract code can enforce who submits a transaction and how state changes, but it cannot establish that an organization or receipt is trustworthy. Public transparency creates privacy risks, and a one-person payout key creates an operational single point of failure. These limitations are part of the design, not details that a hash or event solves.

## Project status and roadmap

The contract and local test suite are designed for portfolio demonstration. The testnet configuration is prepared, but no verified public testnet deployment is currently listed. This is not audited or production-ready. See [`SECURITY.md`](SECURITY.md).

1. Run and maintain the Hardhat test suite in CI.
2. Deploy to Sepolia with a dedicated test wallet, verify source code, and publish the transaction/address after independently checking it.
3. Explore multi-approver governance, limits, and pause/recovery controls with explicit threat analysis.
4. Define a privacy-safe off-chain evidence process; do not store personal details on chain.
5. Only consider integration with ResponseHub after deciding how event provenance and duplicate/reorg handling should work.

## Production boundary

Before any real use, the project would require independent contract review/audit, multi-party key governance, incident and recovery procedures, legal/privacy review, operational monitoring, and tests against a realistic threat model. No such approval is claimed here.

## Fresh clone checklist

```bash
git clone https://github.com/tanay-gaykwad/relieftrail-blockchain.git
cd relieftrail-blockchain
corepack enable
pnpm install --frozen-lockfile
pnpm test
```

## Contact and license

Open a GitHub issue for non-sensitive questions. Do not share private keys or private evidence. This project is available under the MIT License.
