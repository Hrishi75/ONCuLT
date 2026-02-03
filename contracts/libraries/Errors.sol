// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    error NotOwner();
    error ZeroAddress();
    error ArrayLengthMismatch();
    error InvalidBpsSum();
    error InvalidBpsValue();
    error DuplicateRecipient();
    error SplitNotFound();
    error TokenNotAllowed();
    error AmountZero();
    error IntentAlreadyProcessed();
    error DropNotFound();
    error DropSoldOut();
    error BadQuantity();
    error SaleNotActive();
    error InsufficientFunds();
    error WithdrawFailed();
}
