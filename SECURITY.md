# Security review notes

## Current security posture

This repository contains a small educational contract, automated unit tests, and a Sepolia deployment script that refuses the wrong chain. It has not been audited, formally verified, or approved to hold funds. Do not send real assets to it.

## Controls present

- Payouts are restricted to the immutable deployer address.
- Zero donations, invalid recipients, zero/over-balance payouts, missing evidence fingerprints, and empty/oversized purposes revert.
- State changes happen before the external recipient call. EVM revert semantics roll the state back if the recipient rejects the transfer.
- The recipient rejection test checks the failed-call rollback path.
- CI runs lint, compile, and local contract tests without requiring a private key or external RPC.
- Sepolia deployment configuration is loaded only from local environment variables and checks the chain ID before deployment.

## Trust and risk boundaries

- **Single-key control:** one deployer controls all payouts. Key loss or compromise is a single point of failure.
- **No identity verification:** the contract does not establish that donors, the organizer, recipients, or aid organizations are legitimate.
- **No real-world verification:** an event or evidence hash does not prove a receipt is authentic, a payment was appropriate, or aid reached anyone.
- **Public metadata:** recipient addresses, amounts, purposes, and hashes are public and permanent. Never publish personal or sensitive information in contract inputs.
- **Shared balance:** donations are not earmarked. There is no refund, restricted-grant accounting, emergency pause, or payout recovery mechanism.
- **External call:** the contract transfers native currency using a low-level call. The current checks-effects-interactions order and rollback behavior are tested, but this does not replace independent adversarial review.

## Before any live use

Use a dedicated test wallet for Sepolia only. Never commit `.env`, share a private key in chat, or reuse a mainnet wallet key. Before considering real funds, commission an independent contract audit, design multi-party governance and recovery, define privacy/compliance operations, and test the full deployment and incident process. The current project is not ready for that use.

## Reporting concerns

Do not publish private keys, private evidence, or personal information in issues. Contact the repository owner via the public GitHub profile with a minimal reproduction. This portfolio project does not promise a monitored security response service.
