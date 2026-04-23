import { describe, it, expect } from "vitest";
import { parseDeployments } from "../deployments";

describe("parseDeployments", () => {
  it("returns a single test deployment when only base-sepolia env vars are set", () => {
    const result = parseDeployments({
      BASE_SEPOLIA_RPC_URL: "https://sepolia.base.example",
      BASE_SEPOLIA_PAYMENT_VAULT: "0x1111111111111111111111111111111111111111",
      BASE_SEPOLIA_SUBSCRIPTION_MANAGER: "0x2222222222222222222222222222222222222222",
    });
    expect(result).toHaveLength(1);
    expect(result[0].networkKey).toBe("base-sepolia");
    expect(result[0].livemode).toBe(false);
    expect(result[0].rpcUrl).toBe("https://sepolia.base.example");
    expect(result[0].paymentVault).toBe("0x1111111111111111111111111111111111111111");
    expect(result[0].subscriptionManager).toBe("0x2222222222222222222222222222222222222222");
  });

  it("returns a single live deployment when only base mainnet env vars are set", () => {
    const result = parseDeployments({
      BASE_RPC_URL: "https://base.example",
      BASE_PAYMENT_VAULT: "0x3333333333333333333333333333333333333333",
      BASE_SUBSCRIPTION_MANAGER: "0x4444444444444444444444444444444444444444",
    });
    expect(result).toHaveLength(1);
    expect(result[0].networkKey).toBe("base");
    expect(result[0].livemode).toBe(true);
  });

  it("returns both when base testnet + mainnet env vars are present", () => {
    const result = parseDeployments({
      BASE_SEPOLIA_RPC_URL: "https://sepolia.base.example",
      BASE_SEPOLIA_PAYMENT_VAULT: "0x1111111111111111111111111111111111111111",
      BASE_SEPOLIA_SUBSCRIPTION_MANAGER: "0x2222222222222222222222222222222222222222",
      BASE_RPC_URL: "https://base.example",
      BASE_PAYMENT_VAULT: "0x3333333333333333333333333333333333333333",
      BASE_SUBSCRIPTION_MANAGER: "0x4444444444444444444444444444444444444444",
    });
    expect(result).toHaveLength(2);
    const modes = result.map((d) => d.livemode).sort();
    expect(modes).toEqual([false, true]);
  });

  it("throws when zero deployments can be constructed", () => {
    expect(() => parseDeployments({})).toThrow(/no deployments/i);
  });

  it("throws when mainnet env vars are partially set", () => {
    expect(() =>
      parseDeployments({
        BASE_RPC_URL: "https://base.example",
        BASE_PAYMENT_VAULT: "0x3333333333333333333333333333333333333333",
        // missing BASE_SUBSCRIPTION_MANAGER
      }),
    ).toThrow(/BASE_SUBSCRIPTION_MANAGER/);
  });

  it("parses Arbitrum One (ARBITRUM_* env prefix, hyphenless key)", () => {
    const result = parseDeployments({
      ARBITRUM_RPC_URL: "https://arb1.arbitrum.example",
      ARBITRUM_PAYMENT_VAULT: "0x5555555555555555555555555555555555555555",
      ARBITRUM_SUBSCRIPTION_MANAGER: "0x6666666666666666666666666666666666666666",
    });
    expect(result).toHaveLength(1);
    expect(result[0].networkKey).toBe("arbitrum");
    expect(result[0].livemode).toBe(true);
  });

  it("parses Polygon Amoy (POLYGON_AMOY_* env prefix, hyphenated key)", () => {
    const result = parseDeployments({
      POLYGON_AMOY_RPC_URL: "https://rpc-amoy.polygon.example",
      POLYGON_AMOY_PAYMENT_VAULT: "0x7777777777777777777777777777777777777777",
      POLYGON_AMOY_SUBSCRIPTION_MANAGER: "0x8888888888888888888888888888888888888888",
    });
    expect(result).toHaveLength(1);
    expect(result[0].networkKey).toBe("polygon-amoy");
    expect(result[0].livemode).toBe(false);
  });

  it("parses multiple chains simultaneously", () => {
    const result = parseDeployments({
      BASE_SEPOLIA_RPC_URL: "https://sepolia.base.example",
      BASE_SEPOLIA_PAYMENT_VAULT: "0x1111111111111111111111111111111111111111",
      BASE_SEPOLIA_SUBSCRIPTION_MANAGER: "0x2222222222222222222222222222222222222222",
      ARBITRUM_SEPOLIA_RPC_URL: "https://sepolia-rollup.arbitrum.example",
      ARBITRUM_SEPOLIA_PAYMENT_VAULT: "0x9999999999999999999999999999999999999999",
      ARBITRUM_SEPOLIA_SUBSCRIPTION_MANAGER: "0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
      OP_SEPOLIA_RPC_URL: "https://sepolia.optimism.example",
      OP_SEPOLIA_PAYMENT_VAULT: "0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      OP_SEPOLIA_SUBSCRIPTION_MANAGER: "0xCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
    });
    expect(result).toHaveLength(3);
    const keys = result.map((d) => d.networkKey).sort();
    expect(keys).toEqual(["arbitrum-sepolia", "base-sepolia", "op-sepolia"]);
    for (const d of result) expect(d.livemode).toBe(false);
  });
});
