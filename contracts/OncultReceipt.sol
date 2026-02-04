// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
contract OncultReceipt is ERC721URIStorage {
    uint256 public nextTokenId = 1;

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

    constructor() ERC721("Oncult Receipt", "ONR") {}

    function mintReceipt(
        address buyer,
        uint256 itemId,
        address seller,
        uint256 priceWei,
        string calldata tokenURI
    ) external payable returns (uint256) {
        require(msg.value == priceWei, "Incorrect payment amount");
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

        return tokenId;
    }
}
