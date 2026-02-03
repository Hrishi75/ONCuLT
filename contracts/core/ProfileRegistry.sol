// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IProfileRegistry.sol";
import "../libraries/Errors.sol";

contract ProfileRegistry is IProfileRegistry {
    struct Profile {
        bytes32 ensNode;
        string ensName;
        PayoutPreferences prefs;
        bytes32 defaultSplitId;
    }

    mapping(address => Profile) private profiles;

    event ENSNodeUpdated(address indexed profile, bytes32 indexed node);
    event ENSNameUpdated(address indexed profile, string name);
    event PayoutPreferencesUpdated(
        address indexed profile,
        uint64 preferredPayoutChainId,
        address preferredPayoutToken,
        address preferredRecipient
    );
    event DefaultSplitUpdated(address indexed profile, bytes32 indexed splitId);

    function setEns(bytes32 node) external {
        profiles[msg.sender].ensNode = node;
        emit ENSNodeUpdated(msg.sender, node);
    }

    function setEnsName(string calldata name) external {
        profiles[msg.sender].ensName = name;
        emit ENSNameUpdated(msg.sender, name);
    }

    function setPayoutPreferences(
        uint64 chainId,
        address token,
        address recipient
    ) external {
        if (token == address(0)) revert Errors.ZeroAddress();
        if (recipient == address(0)) revert Errors.ZeroAddress();

        profiles[msg.sender].prefs = PayoutPreferences({
            preferredPayoutChainId: chainId,
            preferredPayoutToken: token,
            preferredRecipient: recipient
        });

        emit PayoutPreferencesUpdated(msg.sender, chainId, token, recipient);
    }

    function setDefaultSplit(bytes32 splitId) external {
        profiles[msg.sender].defaultSplitId = splitId;
        emit DefaultSplitUpdated(msg.sender, splitId);
    }

    function getEnsNode(address profile) external view returns (bytes32) {
        return profiles[profile].ensNode;
    }

    function getEnsName(address profile) external view returns (string memory) {
        return profiles[profile].ensName;
    }

    function getPayoutPreferences(
        address profile
    ) external view returns (PayoutPreferences memory) {
        return profiles[profile].prefs;
    }

    function getDefaultSplit(address profile) external view returns (bytes32) {
        return profiles[profile].defaultSplitId;
    }
}
