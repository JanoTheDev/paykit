import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getDeployments } from "@paylix/config/deployments";

const LOW_BALANCE_THRESHOLD_WEI = BigInt("1000000000000000");

function getKeeperAddress(): `0x${string}` | null {
  const raw = process.env.KEEPER_PRIVATE_KEY;
  if (!raw) return null;
  const key = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) return null;
  try {
    return privateKeyToAccount(key as `0x${string}`).address;
  } catch {
    return null;
  }
}

export async function GET() {
  const address = getKeeperAddress();
  if (!address) {
    return NextResponse.json(
      { configured: false, error: "KEEPER_PRIVATE_KEY not set or invalid" },
      { status: 200 },
    );
  }

  try {
    const deployments = getDeployments();
    const balances = await Promise.all(
      deployments.map(async (d) => {
        const client = createPublicClient({ chain: d.chain, transport: http(d.rpcUrl) });
        const balanceWei = await client.getBalance({ address });
        const balanceEth = formatEther(balanceWei);
        const low = balanceWei < LOW_BALANCE_THRESHOLD_WEI;
        return { networkKey: d.networkKey, livemode: d.livemode, balanceEth, low };
      }),
    );

    const anyLow = balances.some((b) => b.low);
    const firstBalance = balances[0]?.balanceEth ?? null;

    return NextResponse.json({
      configured: true,
      address,
      low: anyLow,
      balanceEth: firstBalance,
      balances,
    });
  } catch (err) {
    return NextResponse.json(
      {
        configured: true,
        address,
        error: err instanceof Error ? err.message : "Failed to fetch balance",
      },
      { status: 200 },
    );
  }
}
