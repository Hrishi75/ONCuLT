// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
contract OncultReceipt is ERC721URIStorage {
    uint256 public nextTokenId = 1;
    address public platformWallet;

    struct ReceiptData {
        uint256 itemId;
        address seller;
        uint256 priceWei;
        uint256 timestamp;
    }

    mapping(uint256 => ReceiptData) public receipts;

    event ReceiptMinted(
        uint256 indexed tokenId,
        uint256 indexed itemId,
        address indexed buyer,
        address seller,
        uint256 priceWei,
        uint256 timestamp,
        string tokenURI
    );

    constructor(address platformWallet_) ERC721("Oncult Receipt", "ONR") {
        require(platformWallet_ != address(0), "Platform wallet required");
        platformWallet = platformWallet_;
    }

    function mintReceipt(
        address buyer,
        uint256 itemId,
        address seller,
        uint256 priceWei,
        uint16 feeBps,
        string calldata tokenURI
    ) external payable returns (uint256) {
        require(msg.value == priceWei, "Incorrect payment amount");
        require(feeBps <= 1000, "Fee too high");
        uint256 tokenId = nextTokenId++;
        _safeMint(buyer, tokenId);
        _setTokenURI(tokenId, tokenURI);

        receipts[tokenId] = ReceiptData({
            itemId: itemId,
            seller: seller,
            priceWei: priceWei,
            timestamp: block.timestamp
        });

        emit ReceiptMinted(
            tokenId,
            itemId,
            buyer,
            seller,
            priceWei,
            block.timestamp,
            tokenURI
        );

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 sellerAmount = msg.value - fee;

        if (fee > 0) {
            (bool feeSuccess, ) = payable(platformWallet).call{value: fee}("");
            require(feeSuccess, "Platform payout failed");
        }
        (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payout failed");

        return tokenId;
    }
}
