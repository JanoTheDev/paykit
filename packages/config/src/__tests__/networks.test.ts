import { describe, it, expectTypeOf } from "vitest";
import type { NetworkKey, Environment, NetworkConfig, TokenConfig } from "../networks";

describe("registry types", () => {
  it("NetworkKey is a string literal union (compile-time check)", () => {
    // If the union ever widens to `string`, this test file fails to compile.
    expectTypeOf<NetworkKey>().toMatchTypeOf<"base" | "base-sepolia">();
  });

  it("Environment is exactly 'mainnet' | 'testnet'", () => {
    expectTypeOf<Environment>().toMatchTypeOf<"mainnet" | "testnet">();
  });

  it("TokenConfig has required fields", () => {
    const t: TokenConfig = {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      supportsPermit: true,
      eip712Version: "2",
      isStable: true,
      address: "0x0000000000000000000000000000000000000000",
    };
    expectTypeOf(t.decimals).toMatchTypeOf<number>();
  });

  it("NetworkConfig has required fields", () => {
    // Type-only check — actual instance comes in Task 3
    expectTypeOf<NetworkConfig["environment"]>().toMatchTypeOf<Environment>();
  });
});
