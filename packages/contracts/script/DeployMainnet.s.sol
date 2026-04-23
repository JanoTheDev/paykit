// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PaymentVault.sol";
import "../src/SubscriptionManager.sol";

/**
 * Mainnet deploy. USDC address comes from the USDC_ADDRESS env var so the
 * same script works for every EVM mainnet Paylix supports (Ethereum, Base,
 * Arbitrum, Optimism, Polygon, Avalanche, and BNB once Permit2 lands).
 *
 * The outer deploy.sh sets USDC_ADDRESS from the active chain's canonical
 * value in packages/config/src/network-registry.ts before invoking this.
 */
contract DeployMainnet is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        address relayer = vm.envAddress("RELAYER_ADDRESS");
        address usdc = vm.envAddress("USDC_ADDRESS");
        uint256 platformFee = 50;

        vm.startBroadcast(deployerKey);

        PaymentVault vault = new PaymentVault(platformWallet, platformFee);
        SubscriptionManager subs = new SubscriptionManager(platformWallet, platformFee);

        vault.setAcceptedToken(usdc, true);
        subs.setAcceptedToken(usdc, true);

        vault.setRelayer(relayer);
        subs.setRelayer(relayer);

        vm.stopBroadcast();

        console.log("PaymentVault:", address(vault));
        console.log("SubscriptionManager:", address(subs));
        console.log("USDC:", usdc);
        console.log("Relayer set to:", relayer);
    }
}
