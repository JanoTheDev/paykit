import { describe, it, expect } from "vitest";
import { DESCRIPTORS, getDescriptor, type UtxoChainKey } from "../descriptors";

describe("DESCRIPTORS", () => {
  const keys: UtxoChainKey[] = [
    "bitcoin",
    "bitcoin-testnet",
    "litecoin",
    "litecoin-testnet",
  ];

  it("contains every declared chain key", () => {
    for (const k of keys) {
      expect(DESCRIPTORS[k]).toBeDefined();
      expect(DESCRIPTORS[k].key).toBe(k);
    }
  });

  it("every descriptor has 1e8 satoshis per coin (UTXO family)", () => {
    for (const d of Object.values(DESCRIPTORS)) {
      expect(d.satoshisPerCoin).toBe(100_000_000n);
    }
  });

  it("mainnet descriptors carry environment='mainnet'", () => {
    expect(DESCRIPTORS.bitcoin.environment).toBe("mainnet");
    expect(DESCRIPTORS.litecoin.environment).toBe("mainnet");
  });

  it("testnet descriptors carry environment='testnet'", () => {
    expect(DESCRIPTORS["bitcoin-testnet"].environment).toBe("testnet");
    expect(DESCRIPTORS["litecoin-testnet"].environment).toBe("testnet");
  });

  it("bitcoin uses BIP44 coin type 0", () => {
    expect(DESCRIPTORS.bitcoin.bip44CoinType).toBe(0);
  });

  it("litecoin mainnet uses BIP44 coin type 2", () => {
    expect(DESCRIPTORS.litecoin.bip44CoinType).toBe(2);
  });

  it("both testnets use BIP44 coin type 1 (standard for all testnets)", () => {
    expect(DESCRIPTORS["bitcoin-testnet"].bip44CoinType).toBe(1);
    expect(DESCRIPTORS["litecoin-testnet"].bip44CoinType).toBe(1);
  });

  it("bech32 HRPs are distinct per chain", () => {
    const hrps = Object.values(DESCRIPTORS).map((d) => d.network.bech32);
    expect(new Set(hrps).size).toBe(hrps.length);
  });

  it("mainnets default to stricter confirmation thresholds than testnets", () => {
    expect(DESCRIPTORS.bitcoin.defaultConfirmations).toBeGreaterThanOrEqual(
      DESCRIPTORS["bitcoin-testnet"].defaultConfirmations,
    );
    expect(DESCRIPTORS.litecoin.defaultConfirmations).toBeGreaterThanOrEqual(
      DESCRIPTORS["litecoin-testnet"].defaultConfirmations,
    );
  });

  it("litecoin mainnet is at least as strict as bitcoin mainnet (faster blocks, more needed)", () => {
    expect(DESCRIPTORS.litecoin.defaultConfirmations).toBeGreaterThanOrEqual(
      DESCRIPTORS.bitcoin.defaultConfirmations,
    );
  });

  it("explorer templates include {txid}", () => {
    for (const d of Object.values(DESCRIPTORS)) {
      expect(d.explorerTxUrl).toContain("{txid}");
    }
  });

  it("BIP32 public/private version bytes are set", () => {
    for (const d of Object.values(DESCRIPTORS)) {
      expect(d.network.bip32.public).toBeGreaterThan(0);
      expect(d.network.bip32.private).toBeGreaterThan(0);
    }
  });
});

describe("getDescriptor", () => {
  it("returns the descriptor for known keys", () => {
    const d = getDescriptor("bitcoin");
    expect(d.key).toBe("bitcoin");
  });

  it("throws on unknown keys", () => {
    expect(() => getDescriptor("doge" as UtxoChainKey)).toThrow(/Unknown/);
  });
});
