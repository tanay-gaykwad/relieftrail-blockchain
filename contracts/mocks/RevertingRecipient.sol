// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Test fixture that rejects native-token transfers.
contract RevertingRecipient {
    error RecipientRejectsPayment();

    receive() external payable {
        revert RecipientRejectsPayment();
    }
}
