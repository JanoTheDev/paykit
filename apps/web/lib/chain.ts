import { base, baseSepolia } from "viem/chains";

/**
 * Single source of truth for which network Paylix is running on. Every file
 * that used to import `baseSepolia` directly or hardcode `84532` should
 * import from here instead — that way flipping `NEXT_PUBLIC_NETWORK` in `.env`
 * switches the whole app at once.
 *
 * Both the server and the browser read the same env var (NEXT_PUBLIC_* is
 * inlined at build time). If you add a new network in the future (e.g.
 * Base Goerli, OP Mainnet, etc.), extend the switch below and the rest of
 * the app will follow.
 */

export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || "base-sepolia") as
  | "base"
  | "base-sepolia";

export const IS_MAINNET = NETWORK === "base";

export const CHAIN = IS_MAINNET ? base : baseSepolia;
export const CHAIN_ID: number = CHAIN.id;

/**
 * USDC token address for the active network.
 *
 * On mainnet this defaults to Circle's native Base USDC, which is a fixed
 * canonical address and will never change. Self-hosters can still override
 * it via `NEXT_PUBLIC_USDC_ADDRESS` if they want to use a different stable
 * (e.g. bridged USDbC), but the default is what 99% of users want.
 *
 * On testnet, reads from `NEXT_PUBLIC_USDC_ADDRESS` (preferred) or falls
 * back to the legacy `NEXT_PUBLIC_MOCK_USDC_ADDRESS` variable. The deploy
 * script writes the MockUSDC address into both so older `.env` files keep
 * working.
 */
const BASE_USDC_MAINNET =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
  (IS_MAINNET ? BASE_USDC_MAINNET : undefined)) as `0x${string}` | undefined;
