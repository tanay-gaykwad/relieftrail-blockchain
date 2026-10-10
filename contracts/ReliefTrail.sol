// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReliefTrail
/// @notice An auditable ledger for donations and relief spending.
/// @dev A receipt hash links to evidence; it does not prove that evidence is truthful.
contract ReliefTrail {
    address public immutable reliefOrganizer;
    uint256 public totalDonated;
    uint256 public totalPaidOut;
    uint256 public donationCount;
    uint256 public payoutCount;

    event DonationReceived(address indexed donor, uint256 amount, uint256 newBalance);
    event ReliefPaid(
        address indexed recipient,
        uint256 amount,
        string purpose,
        bytes32 evidenceHash
    );

    error OrganizerOnly();
    error ZeroDonation();
    error ZeroAddress();
    error InvalidPayoutAmount();
    error MissingEvidenceHash();
    error InvalidPurpose();
    error PayoutFailed();

    uint256 public constant MAX_PURPOSE_BYTES = 160;

    constructor() {
        reliefOrganizer = msg.sender;
    }

    /// @notice Add a donation in the network's native currency (ETH on Ethereum).
    function donate() external payable {
        if (msg.value == 0) revert ZeroDonation();
        totalDonated += msg.value;
        donationCount += 1;
        emit DonationReceived(msg.sender, msg.value, address(this).balance);
    }

    /// @notice Pay relief funds and publish a fingerprint for an off-chain receipt/evidence file.
    /// @param recipient Wallet receiving the payout.
    /// @param amount Amount in wei.
    /// @param purpose Public description of at most 160 bytes. Never include personal or sensitive data.
    /// @param evidenceHash Keccak-256 fingerprint of an evidence file stored off-chain.
    function payRelief(
        address payable recipient,
        uint256 amount,
        string calldata purpose,
        bytes32 evidenceHash
    ) external {
        if (msg.sender != reliefOrganizer) revert OrganizerOnly();
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0 || amount > address(this).balance) revert InvalidPayoutAmount();
        if (evidenceHash == bytes32(0)) revert MissingEvidenceHash();
        if (bytes(purpose).length == 0 || bytes(purpose).length > MAX_PURPOSE_BYTES) revert InvalidPurpose();

        // Effects before the external call; a failed transfer reverts the transaction.
        totalPaidOut += amount;
        payoutCount += 1;
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert PayoutFailed();

        emit ReliefPaid(recipient, amount, purpose, evidenceHash);
    }

    /// @notice Current funds held by this contract.
    function availableBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
