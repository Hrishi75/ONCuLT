// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * MerchPurchaseRecorder
 * ---------------------
 * Records purchase receipts for marketplace merch. Confirmable on Etherscan via emitted events. Can also search in Event Tabs buyer/OrderId/recieptId.
 *
 * NOTE: Solidity cannot access the tx hash. Instead we emit an event; the tx hash is the tx that includes the event.
 */
contract MerchPurchaseRecorder is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Receipt {
        address buyer;
        address seller;
        address token; // payment token (e.g., USDC) or address(0) for ETH
        uint256 amount; // amount paid (token decimals apply) 10_6 for USDC $10.00 10_18 for ETH $10.00
        uint256 merchId; // your internal merch / listing id
        uint256 quantity;
        uint64 chainId; // recorded for UX; should match block.chainid
        uint64 timestamp; // block timestamp
        bytes32 orderId; // off-chain or app-generated id for correlation (optional)
        bytes32 metaHash; // hash of metadata JSON / IPFS CID / SKU bundle (optional)
    }

    // receiptId => Receipt
    mapping(bytes32 => Receipt) private _receipts;

    // prevents duplicate receipts
    mapping(bytes32 => bool) public receiptExists;

    event MerchPurchased(
        bytes32 indexed receiptId,
        bytes32 indexed orderId,
        address indexed buyer,
        address seller,
        uint256 merchId,
        uint256 quantity,
        address token,
        uint256 amount,
        uint64 chainId,
        bytes32 metaHash
    );

    constructor(address admin) {
        require(admin != address(0), "admin=0");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * recordPurchase
     * --------------
     * Called by our marketplace contract (preferred) or a trusted backend signer.
     *
     * receiptId: deterministic unique id (recommended: keccak256(abi.encode(orderId, buyer, merchId, quantity, amount, token))) Unique ID will be ENS in the future.
     * orderId: app-level id (optional but great for UX + indexing)
     */
    function recordPurchase(
        bytes32 receiptId,
        bytes32 orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount,
        uint256 merchId,
        uint256 quantity,
        bytes32 metaHash
    ) external whenNotPaused nonReentrant onlyRole(RECORDER_ROLE) {
        require(!receiptExists[receiptId], "receipt exists");
        require(buyer != address(0), "buyer=0");
        require(seller != address(0), "seller=0");
        require(quantity > 0, "qty=0");
        require(amount > 0, "amount=0");

        receiptExists[receiptId] = true;

        Receipt memory r = Receipt({
            buyer: buyer,
            seller: seller,
            token: token,
            amount: amount,
            merchId: merchId,
            quantity: quantity,
            chainId: uint64(block.chainid),
            timestamp: uint64(block.timestamp),
            orderId: orderId,
            metaHash: metaHash
        });

        _receipts[receiptId] = r;

        emit MerchPurchased(
            receiptId,
            orderId,
            buyer,
            seller,
            merchId,
            quantity,
            token,
            amount,
            uint64(block.chainid),
            metaHash
        );
    }

    function getReceipt(
        bytes32 receiptId
    ) external view returns (Receipt memory) {
        require(receiptExists[receiptId], "missing receipt");
        return _receipts[receiptId];
    }
}
