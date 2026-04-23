import { type Chain } from "viem";
import { NETWORKS, type NetworkKey } from "./network-registry";

export interface Deployment {
  networkKey: NetworkKey;
  livemode: boolean;
  rpcUrl: string;
  paymentVault: `0x${string}`;
  subscriptionManager: `0x${string}`;
  chain: Chain;
}

type Env = Record<string, string | undefined>;

function envPrefix(networkKey: NetworkKey): string {
  return networkKey.replace(/-/g, "_").toUpperCase();
}

function envKeys(networkKey: NetworkKey) {
  const p = envPrefix(networkKey);
  return {
    rpcUrl: `${p}_RPC_URL`,
    paymentVault: `${p}_PAYMENT_VAULT`,
    subscriptionManager: `${p}_SUBSCRIPTION_MANAGER`,
  };
}

function required(env: Env, key: string): string {
  const v = env[key];
  if (!v) throw new Error(`${key} is required when its deployment group is active`);
  return v;
}

function isAddress(v: string): v is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

function requireAddress(env: Env, key: string): `0x${string}` {
  const v = required(env, key);
  if (!isAddress(v)) throw new Error(`${key} is not a valid Ethereum address: ${v}`);
  return v;
}

function hasAny(env: Env, ...keys: string[]): boolean {
  return keys.some((k) => env[k] !== undefined && env[k] !== "");
}

/**
 * Parse per-chain deployment groups from env. A group is "active" if any of
 * its three env vars is set; once active, all three are required.
 *
 * Env naming scheme: `${NETWORK_KEY_UPPER}_RPC_URL` / `_PAYMENT_VAULT` /
 * `_SUBSCRIPTION_MANAGER`, with hyphens replaced by underscores. Examples:
 *   BASE_SEPOLIA_RPC_URL, ARBITRUM_PAYMENT_VAULT, POLYGON_AMOY_SUBSCRIPTION_MANAGER.
 */
export function parseDeployments(env: Env): Deployment[] {
  const out: Deployment[] = [];

  for (const [key, network] of Object.entries(NETWORKS)) {
    const k = envKeys(key as NetworkKey);
    if (!hasAny(env, k.rpcUrl, k.paymentVault, k.subscriptionManager)) continue;

    out.push({
      networkKey: key as NetworkKey,
      livemode: network.environment === "mainnet",
      rpcUrl: required(env, k.rpcUrl),
      paymentVault: requireAddress(env, k.paymentVault),
      subscriptionManager: requireAddress(env, k.subscriptionManager),
      chain: network.viemChain,
    });
  }

  if (out.length === 0) {
    const sample = envKeys("base-sepolia" as NetworkKey);
    throw new Error(
      `No deployments could be parsed — set at least one group of ${sample.rpcUrl} / ${sample.paymentVault} / ${sample.subscriptionManager} (or the equivalents for any other supported chain)`,
    );
  }

  return out;
}

export function getDeployments(): Deployment[] {
  return parseDeployments(process.env);
}
