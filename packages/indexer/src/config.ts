import { getDeployments, type Deployment } from "@paylix/config/deployments";

export const deployments: Deployment[] = getDeployments();

// Shared config applies across every deployment.
export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  keeperPrivateKey: process.env.KEEPER_PRIVATE_KEY! as `0x${string}`,
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined,
  keeperIntervalMinutes: parseInt(process.env.KEEPER_INTERVAL_MINUTES || "60", 10),
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultFromEmail: process.env.INVOICE_FROM_EMAIL ?? "invoices@paylix.local",
};
