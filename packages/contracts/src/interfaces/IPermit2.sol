// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.24;

/**
 * @title IPermit2
 * @notice Minimal interface for Uniswap's Permit2 contract's signature-transfer
 *         flow. Full source: https://github.com/Uniswap/permit2
 *
 * Deployed at the same deterministic address on every EVM chain Paylix
 * supports: `0x000000000022D473030F116dDEE9F6B43aC78BA3`.
 *
 * Permit2 lets us pull funds from tokens that don't implement EIP-2612
 * (USDT, WBTC, WETH, older DAI deployments) using a single signed message
 * that authorizes a one-off transfer. The signature is EIP-712 over
 * Permit2's own domain, not the caller contract's — so Paylix's PaymentIntent
 * remains a separate binding signature on top.
 */
interface IPermit2 {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct PermitTransferFrom {
        TokenPermissions permitted;
        uint256 nonce;
        uint256 deadline;
    }

    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }

    /// Pulls `requestedAmount` of `permitted.token` from `owner` to `transferDetails.to`.
    /// Reverts on bad signature, expired deadline, exceeded amount, or reused nonce.
    function permitTransferFrom(
        PermitTransferFrom calldata permit,
        SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;

    /// EIP-712 domain separator — used off-chain to build the signature.
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}
