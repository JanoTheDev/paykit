import { NextResponse } from "next/server";
import { formatEther } from "viem";
import { createRelayerClient, getRelayerAddress } from "@/lib/relayer";

// Warn below 0.001 ETH — roughly 200 relayed txs left at typical Base gas
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
    const client = createRelayerClient();
    const balance = await client.getBalance({ address });
    const low = balance < LOW_BALANCE_THRESHOLD_WEI;
    return NextResponse.json({
      configured: true,
      address,
      balanceWei: balance.toString(),
      balanceEth: formatEther(balance),
      low,
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
