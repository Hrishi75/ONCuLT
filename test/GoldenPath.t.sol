// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "../contracts/core/ProfileRegistry.sol";
import "../contracts/core/SplitRouter.sol";
import "../contracts/core/PayoutVault.sol";
import "../contracts/drops/EventDrops1155.sol";
import "../contracts/mocks/MockUSDC.sol";

contract GoldenPathTest is Test {
    ProfileRegistry registry;
    SplitRouter router;
    PayoutVault vault;
    EventDrops1155 drops;
    MockUSDC usdc;

    address owner = address(0xA11CE);
    address creator = address(0xBEEF);
    address manager = address(0xCAFE);
    address buyer = address(0xD00D);

    function setUp() public {
        vm.startPrank(owner);

        registry = new ProfileRegistry();
        router = new SplitRouter();
        vault = new PayoutVault(address(router), owner);

        usdc = new MockUSDC();
        vault.setAllowedToken(address(usdc), true);

        drops = new EventDrops1155(
            address(vault),
            address(usdc),
            "ipfs://base/",
            owner
        );

        vm.stopPrank();
    }

    function testGoldenPath_ProfileSplitDropBuyClaim() public {
        // 1) Creator sets profile + ENS + payout prefs
        vm.startPrank(creator);

        registry.setEnsName("artist.eth");
        registry.setEns(bytes32(uint256(1234)));
        registry.setPayoutPreferences(uint64(1), address(usdc), creator);

        // Split: 90% creator, 10% manager
        address[] memory recipients = new address[](2);
        uint16[] memory bps = new uint16[](2);
        recipients[0] = creator;
        recipients[1] = manager;

        bps[0] = 9000;
        bps[1] = 1000;

        bytes32 splitId = router.createSplit(recipients, bps);

        vm.stopPrank();

        // 2) Owner creates an event + drop that uses the split
        bytes32 eventId = keccak256("EVENT_001");
        uint64 start = uint64(block.timestamp); // active now
        uint64 end = uint64(block.timestamp + 7 days); // ends later

        vm.startPrank(owner);
        drops.createEvent(eventId, creator, "ipfs://event-uri", start, end);

        uint256 dropId = 1;
        uint256 price = 25 * 1e6; // 25 USDC (6 decimals)
        uint256 supply = 100;

        drops.createDrop(
            eventId,
            dropId,
            price,
            supply,
            splitId,
            "ipfs://drop-uri"
        );
        vm.stopPrank();

        // 3) Buyer mints/buys qty=2
        uint256 qty = 2;
        uint256 total = price * qty;

        usdc.mint(buyer, total);

        vm.startPrank(buyer);
        usdc.approve(address(drops), total);
        drops.mintOrBuy(dropId, qty);
        vm.stopPrank();

        // 4) Verify vault credited balances (90/10 split)
        uint256 creatorExpected = (total * 9000) / 10_000;
        uint256 managerExpected = total - creatorExpected; // remainder handling

        assertEq(vault.balanceOf(address(usdc), creator), creatorExpected);
        assertEq(vault.balanceOf(address(usdc), manager), managerExpected);

        // 5) Recipients claim
        uint256 creatorBalBefore = usdc.balanceOf(creator);
        uint256 managerBalBefore = usdc.balanceOf(manager);

        vm.prank(creator);
        uint256 creatorClaimed = vault.claim(address(usdc));

        vm.prank(manager);
        uint256 managerClaimed = vault.claim(address(usdc));

        assertEq(creatorClaimed, creatorExpected);
        assertEq(managerClaimed, managerExpected);

        assertEq(usdc.balanceOf(creator), creatorBalBefore + creatorExpected);
        assertEq(usdc.balanceOf(manager), managerBalBefore + managerExpected);

        // 6) ERC-1155 minted to buyer
        assertEq(drops.balanceOf(buyer, dropId), qty);
    }
}
