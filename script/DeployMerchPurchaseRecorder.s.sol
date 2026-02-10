// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/core/MerchPurchaseRecorder.sol";

contract DeployMerchPurchaseRecorder is Script {
    function run() external returns (MerchPurchaseRecorder recorder) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        // Set admin to the EOA that is broadcasting (you)
        address admin = vm.addr(pk);

        recorder = new MerchPurchaseRecorder(admin);

        vm.stopBroadcast();
    }
}
