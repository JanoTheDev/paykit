import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CHAIN } from "@/lib/chain";

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
    const client = createPublicClient({
      chain: CHAIN,
      transport: http(process.env.RPC_URL),
    });
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
