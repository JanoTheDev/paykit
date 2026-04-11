import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CHAIN } from "./chain";

/**
 * Backend-only. Creates the relayer wallet client used to submit gasless
 * payment transactions. Reads RELAYER_PRIVATE_KEY from env.
 *
 * This file must never be imported into a client component. The private key
 * would leak into the client bundle.
 */

function getRelayerKey(): `0x${string}` {
  const raw = process.env.RELAYER_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      "RELAYER_PRIVATE_KEY is not set. Gasless payments require a relayer wallet. See docs/self-hosting for setup.",
    );
  }
  const key = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "RELAYER_PRIVATE_KEY must be a 32-byte hex string (66 chars including 0x prefix).",
    );
  }
  return key as `0x${string}`;
}

function getRpcUrl(): string {
  const url = process.env.RPC_URL;
  if (!url) {
    throw new Error("RPC_URL is not set");
  }
  return url;
}

export function getRelayerAccount() {
  return privateKeyToAccount(getRelayerKey());
}

export function getRelayerAddress(): `0x${string}` {
  return getRelayerAccount().address;
}

/**
 * Returns a viem walletClient configured with the relayer account, the active
 * Paylix network (see `lib/chain.ts`), and the RPC URL from env. Extended
 * with public actions so the same client can read (waitForTransactionReceipt,
 * getBalance) and write (sendTransaction, writeContract) without juggling
 * two clients.
 */
export function createRelayerClient() {
  const account = getRelayerAccount();
  return createWalletClient({
    account,
    chain: CHAIN,
    transport: http(getRpcUrl()),
  }).extend(publicActions);
}
