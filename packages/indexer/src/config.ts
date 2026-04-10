export const config = {
  rpcUrl: process.env.RPC_URL!,
  databaseUrl: process.env.DATABASE_URL!,
  paymentVaultAddress: process.env.PAYMENT_VAULT_ADDRESS! as `0x${string}`,
  subscriptionManagerAddress: process.env.SUBSCRIPTION_MANAGER_ADDRESS! as `0x${string}`,
  keeperPrivateKey: process.env.KEEPER_PRIVATE_KEY! as `0x${string}`,
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined,
  network: (process.env.NETWORK || process.env.NEXT_PUBLIC_NETWORK || "base-sepolia") as "base" | "base-sepolia",
  keeperIntervalMinutes: parseInt(process.env.KEEPER_INTERVAL_MINUTES || "60", 10),
};
