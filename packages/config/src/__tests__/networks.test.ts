import { describe, it, expectTypeOf } from "vitest";
import type { NetworkKey, Environment, NetworkConfig, TokenConfig } from "../networks";

describe("registry types", () => {
  it("NetworkKey is exactly 'base' | 'base-sepolia'", () => {
    // toEqualTypeOf catches BOTH widening and narrowing — if a future edit
    // either broadens to `string` or drops an entry from the union, this
    // test fails to compile.
    expectTypeOf<NetworkKey>().toEqualTypeOf<"base" | "base-sepolia">();
  });

  it("Environment is exactly 'mainnet' | 'testnet'", () => {
    expectTypeOf<Environment>().toEqualTypeOf<"mainnet" | "testnet">();
  });

  it("TokenConfig has the expected required + optional shape", () => {
    // Construction assignment does the real work — all required fields must
    // be present or this fails to compile.
    const _t: TokenConfig = {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      supportsPermit: true,
      eip712Version: "2",
      isStable: true,
      address: "0x0000000000000000000000000000000000000000",
    };
    void _t;
    // Additional shape assertions that would fail if optionality changes:
    expectTypeOf<TokenConfig["decimals"]>().toEqualTypeOf<number>();
    expectTypeOf<TokenConfig["address"]>().toEqualTypeOf<
      `0x${string}` | undefined
    >();
    expectTypeOf<TokenConfig["addressEnvVar"]>().toEqualTypeOf<
      string | undefined
    >();
  });

  it("NetworkConfig.environment is Environment", () => {
    expectTypeOf<NetworkConfig["environment"]>().toEqualTypeOf<Environment>();
  });
});
