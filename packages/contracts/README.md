# @paylix/contracts

Solidity contracts for the Paylix payment protocol. Non-custodial USDC settlement on Base.

## Contracts

### PaymentVault

One-time payment settlement. Buyers pay merchants directly in USDC with an optional platform fee split in the same transaction.

- **Direct flow** — buyer calls `createPayment` and USDC transfers directly to the merchant
- **Gasless flow** — relayer calls `createPaymentWithPermit` using the buyer's EIP-2612 permit + EIP-712 PaymentIntent signature. The buyer never needs ETH.
- Platform fee is capped at 10% (1000 bps) and deducted atomically
- `Ownable2Step`, `ReentrancyGuard`, `Pausable`

### SubscriptionManager

Recurring USDC billing with keeper-driven charges.

- **Direct flow** — buyer calls `createSubscription`, first charge is processed immediately
- **Gasless flow** — relayer calls `createSubscriptionWithPermit` with buyer's permit (sized for many cycles) + EIP-712 SubscriptionIntent signature
- `chargeSubscription` is called by the keeper/relayer when `nextChargeDate` is reached
- Failed charges move the subscription to `PastDue` (no revert — the keeper stays healthy)
- Subscribers can request wallet updates (two-step: request → accept by new wallet)
- Relayer-scoped cancel helpers for gasless cancellation on behalf of subscribers or merchants

### MockUSDC

ERC-20 + ERC-2612 permit token for testnet. 6 decimals, owner-only minting.

## Security Model

- **Non-custodial**: contracts never hold user balances. USDC moves directly from buyer to merchant via `safeTransferFrom`.
- **Intent binding**: gasless paths require an EIP-712 signed intent from the buyer, binding the exact merchant, amount, token, and nonce. A compromised relayer cannot redirect funds.
- **Permit front-run safety**: permit calls are wrapped in `try/catch` so an already-consumed permit doesn't revert the entire transaction if allowance is sufficient.
- **Access control**: admin functions use `Ownable2Step` (two-step ownership transfer). Emergency `pause`/`unpause` is owner-only.

## Development

Contracts are built and tested with [Foundry](https://book.getfoundry.sh/).

```shell
forge build
forge test
forge test --fuzz-runs 1000    # CI fuzz level
forge fmt
```

On Windows (via WSL):

```shell
wsl bash -lc "cd /mnt/c/path/to/paykit/packages/contracts && ~/.foundry/bin/forge test"
```

### Test Suite

| File | Coverage |
|------|----------|
| `PaymentVault.t.sol` | Core payment flows, fee math, access control |
| `PaymentVaultPause.t.sol` | Pause/unpause behavior |
| `PaymentVaultPermit.t.sol` | Gasless permit + intent verification, relayer restrictions |
| `SubscriptionManager.t.sol` | Subscription lifecycle, charging, cancellation, wallet updates |
| `SubscriptionManagerPause.t.sol` | Pause/unpause behavior |
| `SubscriptionManagerPermit.t.sol` | Gasless subscription creation, intent binding |
| `MockUSDC.t.sol` | Token minting, decimals |
| `mainnet-fork/PaymentVaultMainnetFork.t.sol` | Fork tests against real USDC on Base |

### Static Analysis

Slither runs in CI with `fail-on: medium`. Config is in `slither.config.json`.

### Deployment

```shell
# Testnet (Base Sepolia)
forge script script/DeployTestnet.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Mainnet (Base)
forge script script/DeployMainnet.s.sol --rpc-url $BASE_RPC_URL --broadcast
```

## License

[AGPL-3.0](../../LICENSE)
