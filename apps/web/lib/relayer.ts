import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { WebDeployment } from "./deployment";

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

export function getRelayerAccount() {
  return privateKeyToAccount(getRelayerKey());
}

export function getRelayerAddress(): `0x${string}` {
  return getRelayerAccount().address;
}

/**
 * Returns a viem walletClient configured with the relayer account and the
 * given deployment's chain + RPC URL. Extended with public actions so the
 * same client can read (waitForTransactionReceipt, getBalance) and write
 * (sendTransaction, writeContract) without juggling two clients.
 *
 * Backend-only. This file must never be imported into a client component.
 */
export function createRelayerClient(deployment: WebDeployment) {
  const account = getRelayerAccount();
  return createWalletClient({
    account,
    chain: deployment.chain,
    transport: http(deployment.rpcUrl),
  }).extend(publicActions);
}
