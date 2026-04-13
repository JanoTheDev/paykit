import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { getRelayerAddress } from "@/lib/relayer";
import { getDeployments } from "@paylix/config/deployments";

const LOW_BALANCE_THRESHOLD_WEI = BigInt("1000000000000000");

export async function GET() {
  let address: `0x${string}`;
  try {
    address = getRelayerAddress();
  } catch (err) {
    return NextResponse.json(
      {
        configured: false,
        error: err instanceof Error ? err.message : "Relayer not configured",
      },
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
