// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProfileRegistry {
    struct PayoutPreferences {
        uint64 preferredPayoutChainId;
        address preferredPayoutToken;
        address preferredRecipient;
    }

    function setEns(bytes32 node) external;

    function setEnsName(string calldata name) external;

    function setPayoutPreferences(
        uint64 chainId,
        address token,
        address recipient
    ) external;

    function setDefaultSplit(bytes32 splitId) external;

    function getEnsNode(address profile) external view returns (bytes32);

    function getEnsName(address profile) external view returns (string memory);

    function getPayoutPreferences(
        address profile
    ) external view returns (PayoutPreferences memory);

    function getDefaultSplit(address profile) external view returns (bytes32);
}
