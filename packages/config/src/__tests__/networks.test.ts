import { describe, it, expectTypeOf, expect, afterEach } from "vitest";
import type { NetworkKey, Environment, NetworkConfig, TokenConfig } from "../networks";
import {
  NETWORKS,
  getActiveNetwork,
  getAvailableNetworks,
  resolveTokenAddress,
  assertValidNetworkKey,
  assertValidTokenSymbol,
  getToken,
} from "../networks";
import { base, baseSepolia } from "viem/chains";

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

describe("NETWORKS data", () => {
  it("has a base entry", () => {
    expect(NETWORKS.base).toBeDefined();
    expect(NETWORKS.base.chainId).toBe(8453);
    expect(NETWORKS.base.environment).toBe("mainnet");
    expect(NETWORKS.base.viemChain).toBe(base);
  });

  it("has a base-sepolia entry", () => {
    expect(NETWORKS["base-sepolia"]).toBeDefined();
    expect(NETWORKS["base-sepolia"].chainId).toBe(84532);
    expect(NETWORKS["base-sepolia"].environment).toBe("testnet");
    expect(NETWORKS["base-sepolia"].viemChain).toBe(baseSepolia);
  });

  it("base USDC is Circle's canonical address with version 2", () => {
    const usdc = NETWORKS.base.tokens.USDC;
    expect(usdc).toBeDefined();
    expect(usdc.address).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    expect(usdc.decimals).toBe(6);
    expect(usdc.supportsPermit).toBe(true);
    expect(usdc.eip712Version).toBe("2");
  });

  it("base-sepolia USDC is env-driven with version 1", () => {
    // Cast through TokenConfig so we can assert the optional `address` is absent
    // — the `as const` map narrows the type to a shape without that field, which
    // trips strict tsc even though vitest would pass without the cast.
    const usdc: TokenConfig = NETWORKS["base-sepolia"].tokens.USDC;
    expect(usdc).toBeDefined();
    expect(usdc.address).toBeUndefined();
    expect(usdc.addressEnvVar).toBe("NEXT_PUBLIC_MOCK_USDC_ADDRESS");
    expect(usdc.eip712Version).toBe("1");
  });

  it("every network has a unique chainId", () => {
    const chainIds = Object.values(NETWORKS).map((n) => n.chainId);
    expect(new Set(chainIds).size).toBe(chainIds.length);
  });

  it("every token has exactly one of address or addressEnvVar", () => {
    for (const network of Object.values(NETWORKS)) {
      for (const token of Object.values(network.tokens)) {
        const hasCanonical = token.address !== undefined;
        const hasEnvVar = token.addressEnvVar !== undefined;
        expect(hasCanonical !== hasEnvVar).toBe(true); // XOR
      }
    }
  });

  it("every token has decimals between 1 and 18", () => {
    for (const network of Object.values(NETWORKS)) {
      for (const token of Object.values(network.tokens)) {
        expect(token.decimals).toBeGreaterThan(0);
        expect(token.decimals).toBeLessThanOrEqual(18);
      }
    }
  });
});

describe("getActiveNetwork", () => {
  const originalEnv = process.env.NEXT_PUBLIC_NETWORK;
  afterEach(() => {
    process.env.NEXT_PUBLIC_NETWORK = originalEnv;
  });

  it("returns the network matching NEXT_PUBLIC_NETWORK", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base";
    const n = getActiveNetwork();
    expect(n.key).toBe("base");
  });

  it("returns base-sepolia when NEXT_PUBLIC_NETWORK is base-sepolia", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base-sepolia";
    const n = getActiveNetwork();
    expect(n.key).toBe("base-sepolia");
  });

  it("throws with a clear message on unknown key", () => {
    process.env.NEXT_PUBLIC_NETWORK = "polygon";
    expect(() => getActiveNetwork()).toThrow(/polygon/);
    expect(() => getActiveNetwork()).toThrow(/base/);
  });

  it("throws when NEXT_PUBLIC_NETWORK is unset", () => {
    delete process.env.NEXT_PUBLIC_NETWORK;
    expect(() => getActiveNetwork()).toThrow();
  });
});

describe("getAvailableNetworks", () => {
  const originalEnv = process.env.NEXT_PUBLIC_NETWORK;
  afterEach(() => {
    process.env.NEXT_PUBLIC_NETWORK = originalEnv;
  });

  it("on a mainnet deploy, returns only mainnet networks", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base";
    const list = getAvailableNetworks();
    expect(list.length).toBeGreaterThan(0);
    for (const n of list) expect(n.environment).toBe("mainnet");
  });

  it("on a testnet deploy, returns only testnet networks", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base-sepolia";
    const list = getAvailableNetworks();
    expect(list.length).toBeGreaterThan(0);
    for (const n of list) expect(n.environment).toBe("testnet");
  });

  it("testnet deploy never sees mainnet entries", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base-sepolia";
    const keys = getAvailableNetworks().map((n) => n.key);
    expect(keys).not.toContain("base");
  });

  it("mainnet deploy never sees testnet entries", () => {
    process.env.NEXT_PUBLIC_NETWORK = "base";
    const keys = getAvailableNetworks().map((n) => n.key);
    expect(keys).not.toContain("base-sepolia");
  });
});

describe("resolveTokenAddress", () => {
  const originalMock = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS;
  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS = originalMock;
  });

  it("returns the canonical address for tokens with a hardcoded address", () => {
    const usdc = NETWORKS.base.tokens.USDC;
    expect(resolveTokenAddress(usdc)).toBe(
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    );
  });

  it("reads from env for tokens with addressEnvVar", () => {
    process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS =
      "0xABCdef0123456789ABCdef0123456789ABCdef01";
    const usdc = NETWORKS["base-sepolia"].tokens.USDC;
    expect(resolveTokenAddress(usdc)).toBe(
      "0xABCdef0123456789ABCdef0123456789ABCdef01",
    );
  });

  it("throws when the env var is unset", () => {
    delete process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS;
    const usdc = NETWORKS["base-sepolia"].tokens.USDC;
    expect(() => resolveTokenAddress(usdc)).toThrow(
      /NEXT_PUBLIC_MOCK_USDC_ADDRESS/,
    );
  });

  it("throws when the env var is the zero address", () => {
    process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS =
      "0x0000000000000000000000000000000000000000";
    const usdc = NETWORKS["base-sepolia"].tokens.USDC;
    expect(() => resolveTokenAddress(usdc)).toThrow(
      /NEXT_PUBLIC_MOCK_USDC_ADDRESS/,
    );
  });
});

describe("assertValidNetworkKey", () => {
  it("passes for known keys", () => {
    expect(() => assertValidNetworkKey("base")).not.toThrow();
    expect(() => assertValidNetworkKey("base-sepolia")).not.toThrow();
  });

  it("throws on unknown keys", () => {
    expect(() => assertValidNetworkKey("polygon")).toThrow(/polygon/);
    expect(() => assertValidNetworkKey("")).toThrow();
  });

  it("narrows the type to NetworkKey (compile-time check)", () => {
    const input: string = "base";
    assertValidNetworkKey(input);
    const _k: NetworkKey = input;
    expect(_k).toBe("base");
  });
});

describe("assertValidTokenSymbol", () => {
  it("passes for known symbols on a network", () => {
    expect(() =>
      assertValidTokenSymbol(NETWORKS.base, "USDC"),
    ).not.toThrow();
  });

  it("throws for unknown symbols", () => {
    expect(() =>
      assertValidTokenSymbol(NETWORKS.base, "DOGE"),
    ).toThrow(/DOGE/);
  });
});

describe("getToken", () => {
  it("returns the token config for (network, symbol)", () => {
    const t = getToken("base", "USDC");
    expect(t.symbol).toBe("USDC");
    expect(t.decimals).toBe(6);
  });

  it("throws on unknown network", () => {
    expect(() => getToken("solana" as NetworkKey, "USDC")).toThrow();
  });

  it("throws on unknown symbol", () => {
    expect(() => getToken("base", "DOGE")).toThrow(/DOGE/);
  });
});
