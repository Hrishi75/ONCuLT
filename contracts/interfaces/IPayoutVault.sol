// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPayoutVault {
    function deposit(
        address token,
        uint256 amount,
        bytes32 intentId,
        bytes32 splitId
    ) external;

    function claim(address token) external returns (uint256 claimed);

    function balanceOf(
        address token,
        address account
    ) external view returns (uint256);

    function isIntentProcessed(bytes32 intentId) external view returns (bool);
}
