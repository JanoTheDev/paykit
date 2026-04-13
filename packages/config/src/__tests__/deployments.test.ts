import { describe, it, expect } from "vitest";
import { parseDeployments } from "../deployments";

describe("parseDeployments", () => {
  it("returns a single test deployment when only testnet env vars are set", () => {
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

  it("returns a single live deployment when only mainnet env vars are set", () => {
    const result = parseDeployments({
      BASE_RPC_URL: "https://base.example",
      BASE_PAYMENT_VAULT: "0x3333333333333333333333333333333333333333",
      BASE_SUBSCRIPTION_MANAGER: "0x4444444444444444444444444444444444444444",
    });
    expect(result).toHaveLength(1);
    expect(result[0].networkKey).toBe("base");
    expect(result[0].livemode).toBe(true);
  });

  it("returns both deployments when both sets of env vars are present", () => {
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
});
