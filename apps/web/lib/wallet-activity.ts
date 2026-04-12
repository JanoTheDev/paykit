import { createPublicClient, http, erc20Abi, type Address } from "viem";
import { NETWORKS, type NetworkKey, resolveTokenAddress } from "@paylix/config/networks";

export async function checkWalletActivity(args: {
  address: `0x${string}`;
  networkKey: string;
  tokenSymbol: string;
}): Promise<{ active: boolean; reason?: string }> {
  const network = NETWORKS[args.networkKey as NetworkKey];
  if (!network) return { active: true };

  const client = createPublicClient({
    chain: network.viemChain,
    transport: http(process.env.RPC_URL),
  });

  try {
    const txCount = await client.getTransactionCount({ address: args.address });
    if (txCount > 0) return { active: true };
  } catch {
    return { active: true };
  }

  try {
    const tokenConfig = network.tokens[args.tokenSymbol as keyof typeof network.tokens];
    if (!tokenConfig) return { active: true };

    let tokenAddress: `0x${string}`;
    try {
      tokenAddress = resolveTokenAddress(tokenConfig);
    } catch {
      return { active: true };
    }

    const balance = await client.readContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [args.address],
    });
    if (balance > 0n) return { active: true };
  } catch {
    return { active: true };
  }

  return { active: false, reason: "no_history" };
}
