// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ISplitRouter.sol";
import "../libraries/Bps.sol";
import "../libraries/Errors.sol";

contract SplitRouter is ISplitRouter {
    struct Split {
        address[] recipients;
        uint16[] bps;
        bool exists;
    }

    mapping(bytes32 => Split) private splits;

    event SplitCreated(bytes32 indexed splitId, address indexed creator);

    function createSplit(
        address[] calldata recipients,
        uint16[] calldata bps
    ) external returns (bytes32 splitId) {
        if (recipients.length == 0) revert Errors.ArrayLengthMismatch();
        if (recipients.length != bps.length)
            revert Errors.ArrayLengthMismatch();

        _validate(recipients, bps);

        splitId = keccak256(abi.encode(recipients, bps));
        if (!splits[splitId].exists) {
            // store
            splits[splitId] = Split({
                recipients: recipients,
                bps: bps,
                exists: true
            });
            emit SplitCreated(splitId, msg.sender);
        }
    }

    function previewSplit(
        bytes32 splitId,
        uint256 amount
    )
        external
        view
        returns (address[] memory recipients, uint256[] memory amounts)
    {
        Split storage s = splits[splitId];
        if (!s.exists) revert Errors.SplitNotFound();

        recipients = s.recipients;
        amounts = new uint256[](recipients.length);

        // deterministic split w/ remainder: last recipient gets the dust
        uint256 running;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 share;
            if (i == recipients.length - 1) {
                share = amount - running;
            } else {
                share = (amount * s.bps[i]) / Bps.ONE_HUNDRED_PCT;
                running += share;
            }
            amounts[i] = share;
        }
    }

    function getSplit(
        bytes32 splitId
    )
        external
        view
        returns (address[] memory recipients, uint16[] memory bps, bool exists)
    {
        Split storage s = splits[splitId];
        return (s.recipients, s.bps, s.exists);
    }

    function _validate(
        address[] calldata recipients,
        uint16[] calldata bps
    ) internal pure {
        uint256 sum;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert Errors.ZeroAddress();
            if (bps[i] == 0) revert Errors.InvalidBpsValue();
            sum += bps[i];

            // naive duplicate check (O(n^2)) is fine for MVP (small arrays)
            for (uint256 j = i + 1; j < recipients.length; j++) {
                if (recipients[i] == recipients[j])
                    revert Errors.DuplicateRecipient();
            }
        }
        if (sum != Bps.ONE_HUNDRED_PCT) revert Errors.InvalidBpsSum();
    }
}
