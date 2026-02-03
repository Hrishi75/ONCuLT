// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IPayoutVault.sol";
import "../libraries/Errors.sol";

contract EventDrops1155 is ERC1155, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct EventInfo {
        address organizer;
        uint64 start;
        uint64 end;
        string uri;
        bool exists;
    }

    struct Drop {
        bytes32 eventId;
        uint256 price; // price per unit in token decimals (USDC 6)
        uint256 supply; // max units
        uint256 minted; // minted units
        bytes32 splitId; // split template
        string uri; // metadata uri for the dropId
        bool exists;
    }

    // eventId => info
    mapping(bytes32 => EventInfo) public events;

    // dropId => Drop
    mapping(uint256 => Drop) public drops;

    // tokenId => uri override
    mapping(uint256 => string) private tokenUris;

    IPayoutVault public immutable vault;
    address public immutable settlementToken; // USDC in MVP

    event EventCreated(
        bytes32 indexed eventId,
        address indexed organizer,
        uint64 start,
        uint64 end,
        string uri
    );
    event DropCreated(
        uint256 indexed dropId,
        bytes32 indexed eventId,
        uint256 price,
        uint256 supply,
        bytes32 splitId,
        string uri
    );
    event Purchased(
        uint256 indexed dropId,
        address indexed buyer,
        uint256 qty,
        uint256 totalPaid,
        bytes32 intentId
    );

    constructor(
        address _vault,
        address _settlementToken,
        string memory baseURI,
        address _owner
    ) ERC1155(baseURI) {
        if (_vault == address(0)) revert Errors.ZeroAddress();
        if (_settlementToken == address(0)) revert Errors.ZeroAddress();
        vault = IPayoutVault(_vault);
        settlementToken = _settlementToken;
        _transferOwnership(_owner);
    }

    function uri(uint256 id) public view override returns (string memory) {
        string memory u = tokenUris[id];
        if (bytes(u).length > 0) return u;
        return super.uri(id);
    }

    function createEvent(
        bytes32 eventId,
        address organizer,
        string calldata eventUri,
        uint64 start,
        uint64 end
    ) external whenNotPaused onlyOwner {
        if (organizer == address(0)) revert Errors.ZeroAddress();
        events[eventId] = EventInfo({
            organizer: organizer,
            start: start,
            end: end,
            uri: eventUri,
            exists: true
        });
        emit EventCreated(eventId, organizer, start, end, eventUri);
    }

    function createDrop(
        bytes32 eventId,
        uint256 dropId,
        uint256 price,
        uint256 supply,
        bytes32 splitId,
        string calldata dropUri
    ) external whenNotPaused onlyOwner {
        if (!events[eventId].exists) revert Errors.DropNotFound();
        if (supply == 0) revert Errors.BadQuantity();
        if (price == 0) revert Errors.AmountZero();

        drops[dropId] = Drop({
            eventId: eventId,
            price: price,
            supply: supply,
            minted: 0,
            splitId: splitId,
            uri: dropUri,
            exists: true
        });

        tokenUris[dropId] = dropUri;

        emit DropCreated(dropId, eventId, price, supply, splitId, dropUri);
    }

    function mintOrBuy(
        uint256 dropId,
        uint256 qty
    ) external nonReentrant whenNotPaused {
        Drop storage d = drops[dropId];
        if (!d.exists) revert Errors.DropNotFound();
        if (qty == 0) revert Errors.BadQuantity();
        if (d.minted + qty > d.supply) revert Errors.DropSoldOut();

        // Optional: enforce sale window based on event start/end
        EventInfo storage e = events[d.eventId];
        if (e.exists) {
            uint256 t = block.timestamp;
            // allow mint during [start, end] if set
            if (e.start != 0 && t < e.start) revert Errors.SaleNotActive();
            if (e.end != 0 && t > e.end) revert Errors.SaleNotActive();
        }

        uint256 total = d.price * qty;

        // Pull USDC to this contract, then approve Vault, then deposit.
        IERC20(settlementToken).safeTransferFrom(
            msg.sender,
            address(this),
            total
        );

        // Approve vault to pull total for this deposit
        IERC20(settlementToken).safeIncreaseAllowance(address(vault), total);

        // Unique intentId for audit + replay protection
        bytes32 intentId = keccak256(
            abi.encodePacked(
                "PRIMARY_SALE",
                dropId,
                msg.sender,
                qty,
                block.number
            )
        );

        vault.deposit(settlementToken, total, intentId, d.splitId);

        // Mint the ERC-1155 token(s)
        d.minted += qty;
        _mint(msg.sender, dropId, qty, "");

        emit Purchased(dropId, msg.sender, qty, total, intentId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
