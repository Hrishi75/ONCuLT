// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISplitRouter {
    function createSplit(
        address[] calldata recipients,
        uint16[] calldata bps
    ) external returns (bytes32 splitId);

    function previewSplit(
        bytes32 splitId,
        uint256 amount
    )
        external
        view
        returns (address[] memory recipients, uint256[] memory amounts);

    function getSplit(
        bytes32 splitId
    )
        external
        view
        returns (address[] memory recipients, uint16[] memory bps, bool exists);
}
