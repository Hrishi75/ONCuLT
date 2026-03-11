// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/ISplitRouter.sol";
import "../interfaces/IPayoutVault.sol";
import "../libraries/Errors.sol";

contract PayoutVault is IPayoutVault, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ISplitRouter public immutable splitRouter;

    mapping(address => bool) public allowedToken; // token => allowed
    mapping(bytes32 => bool) private intentProcessed;

    // balances[token][recipient] = claimable amount
    mapping(address => mapping(address => uint256)) private balances;

    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event Deposited(
        bytes32 indexed intentId,
        bytes32 indexed splitId,
        address indexed depositor,
        address token,
        uint256 amount
    );
    event Credited(
        bytes32 indexed intentId,
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    event Claimed(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    constructor(address _splitRouter, address _owner) {
        if (_splitRouter == address(0)) revert Errors.ZeroAddress();
        splitRouter = ISplitRouter(_splitRouter);
        _transferOwnership(_owner);
    }

    function setAllowedToken(address token, bool allowed) external onlyOwner {
        if (token == address(0)) revert Errors.ZeroAddress();
        allowedToken[token] = allowed;
        emit TokenAllowlistUpdated(token, allowed);
    }

    function isIntentProcessed(bytes32 intentId) external view returns (bool) {
        return intentProcessed[intentId];
    }

    function balanceOf(
        address token,
        address account
    ) external view returns (uint256) {
        return balances[token][account];
    }

    function deposit(
        address token,
        uint256 amount,
        bytes32 intentId,
        bytes32 splitId
    ) external whenNotPaused {
        if (!allowedToken[token]) revert Errors.TokenNotAllowed();
        if (amount == 0) revert Errors.AmountZero();
        if (intentProcessed[intentId]) revert Errors.IntentAlreadyProcessed();

        intentProcessed[intentId] = true;

        // Pull funds in
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Preview split
        (address[] memory recipients, uint256[] memory amounts) = splitRouter
            .previewSplit(splitId, amount);

        // Credit balances (pull-payment model)
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 credit = amounts[i];
            if (credit == 0) continue;
            balances[token][recipients[i]] += credit;
            emit Credited(intentId, token, recipients[i], credit);
        }

        emit Deposited(intentId, splitId, msg.sender, token, amount);
    }

    function claim(
        address token
    ) external nonReentrant whenNotPaused returns (uint256 claimed) {
        claimed = balances[token][msg.sender];
        if (claimed == 0) return 0;

        balances[token][msg.sender] = 0;
        IERC20(token).safeTransfer(msg.sender, claimed);

        emit Claimed(token, msg.sender, claimed);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
