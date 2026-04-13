import { type Chain } from "viem";
import { NETWORKS, type NetworkKey } from "./networks";

export interface Deployment {
  networkKey: NetworkKey;
  livemode: boolean;
  rpcUrl: string;
  paymentVault: `0x${string}`;
  subscriptionManager: `0x${string}`;
  chain: Chain;
}

type Env = Record<string, string | undefined>;

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
  if (!isAddress(v)) {
    throw new Error(`${key} is not a valid Ethereum address: ${v}`);
  }
  return v;
}

function hasAny(env: Env, ...keys: string[]): boolean {
  return keys.some((k) => env[k] !== undefined && env[k] !== "");
}

export function parseDeployments(env: Env): Deployment[] {
  const out: Deployment[] = [];

  const hasTest = hasAny(
    env,
    "BASE_SEPOLIA_RPC_URL",
    "BASE_SEPOLIA_PAYMENT_VAULT",
    "BASE_SEPOLIA_SUBSCRIPTION_MANAGER",
  );
  const hasLive = hasAny(
    env,
    "BASE_RPC_URL",
    "BASE_PAYMENT_VAULT",
    "BASE_SUBSCRIPTION_MANAGER",
  );

  if (hasTest) {
    out.push({
      networkKey: "base-sepolia",
      livemode: false,
      rpcUrl: required(env, "BASE_SEPOLIA_RPC_URL"),
      paymentVault: requireAddress(env, "BASE_SEPOLIA_PAYMENT_VAULT"),
      subscriptionManager: requireAddress(env, "BASE_SEPOLIA_SUBSCRIPTION_MANAGER"),
      chain: NETWORKS["base-sepolia"].viemChain,
    });
  }

  if (hasLive) {
    out.push({
      networkKey: "base",
      livemode: true,
      rpcUrl: required(env, "BASE_RPC_URL"),
      paymentVault: requireAddress(env, "BASE_PAYMENT_VAULT"),
      subscriptionManager: requireAddress(env, "BASE_SUBSCRIPTION_MANAGER"),
      chain: NETWORKS["base"].viemChain,
    });
  }

  if (out.length === 0) {
    throw new Error(
      "No deployments could be parsed — set BASE_SEPOLIA_* and/or BASE_* env vars",
    );
  }

  return out;
}

export function getDeployments(): Deployment[] {
  return parseDeployments(process.env);
}
