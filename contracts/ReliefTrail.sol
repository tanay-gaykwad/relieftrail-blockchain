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

    event DonationReceived(address indexed donor, string responseCode, uint256 amount, uint256 newBalance);
    event ReliefPaid(
        address indexed recipient,
        string responseCode,
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
    error InvalidResponseCode();
    error PayoutFailed();

    uint256 public constant MAX_PURPOSE_BYTES = 160;

    constructor() {
        reliefOrganizer = msg.sender;
    }

    /// @notice Add a donation in native currency and link it to a public response code.
    /// @dev Response codes are public metadata. Do not use them for beneficiary identity or secrets.
    function donate(string calldata responseCode) external payable {
        _validateResponseCode(responseCode);
        if (msg.value == 0) revert ZeroDonation();
        totalDonated += msg.value;
        donationCount += 1;
        emit DonationReceived(msg.sender, responseCode, msg.value, address(this).balance);
    }

    /// @notice Pay relief funds and publish a fingerprint for an off-chain receipt/evidence file.
    /// @param recipient Wallet receiving the payout.
    /// @param responseCode Public ResponseHub code linking the payout to a response.
    /// @param amount Amount in wei.
    /// @param purpose Public description of at most 160 bytes. Never include personal or sensitive data.
    /// @param evidenceHash Keccak-256 fingerprint of an evidence file stored off-chain.
    function payRelief(
        address payable recipient,
        string calldata responseCode,
        uint256 amount,
        string calldata purpose,
        bytes32 evidenceHash
    ) external {
        if (msg.sender != reliefOrganizer) revert OrganizerOnly();
        _validateResponseCode(responseCode);
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0 || amount > address(this).balance) revert InvalidPayoutAmount();
        if (evidenceHash == bytes32(0)) revert MissingEvidenceHash();
        if (bytes(purpose).length == 0 || bytes(purpose).length > MAX_PURPOSE_BYTES) revert InvalidPurpose();

        // Effects before the external call; a failed transfer reverts the transaction.
        totalPaidOut += amount;
        payoutCount += 1;
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert PayoutFailed();

        emit ReliefPaid(recipient, responseCode, amount, purpose, evidenceHash);
    }

    function _validateResponseCode(string calldata responseCode) private pure {
        bytes calldata code = bytes(responseCode);
        if (code.length < 3 || code.length > 40) revert InvalidResponseCode();
        for (uint256 i = 0; i < code.length; i++) {
            bytes1 char = code[i];
            if (!((char >= 0x41 && char <= 0x5A) || (char >= 0x30 && char <= 0x39) || char == 0x2D)) {
                revert InvalidResponseCode();
            }
        }
    }

    /// @notice Current funds held by this contract, including any unsolicited native currency.
    function availableBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Balance above the net donation ledger, such as forcibly sent native currency.
    /// @dev This is an accounting signal, not proof of donation origin or a separate spending restriction.
    function unaccountedBalance() external view returns (uint256) {
        uint256 accountedBalance = totalDonated > totalPaidOut ? totalDonated - totalPaidOut : 0;
        uint256 actualBalance = address(this).balance;
        return actualBalance > accountedBalance ? actualBalance - accountedBalance : 0;
    }
}
