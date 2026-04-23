import { describe, it, expect } from "vitest";
import { deriveSessionAddress, validateXpub } from "../hd";
import { createElectrumClient } from "../electrum";
import { startWatcher } from "../watcher";
import { DESCRIPTORS } from "../descriptors";

/**
 * These interface stubs intentionally throw with a pointer to issue #58 so
 * callers catch the integration gap early. The tests lock that behavior in —
 * implementation PRs must replace the throws with real logic, and can
 * delete these "still-stubbed" assertions when they do.
 */
describe("hd stubs", () => {
  it("deriveSessionAddress throws with #58 pointer", () => {
    expect(() =>
      deriveSessionAddress({ key: "xpub…", descriptor: DESCRIPTORS.bitcoin }, 0),
    ).toThrow(/#58/);
  });

  it("validateXpub throws with #58 pointer", () => {
    expect(() => validateXpub("xpub…", DESCRIPTORS.bitcoin)).toThrow(/#58/);
  });
});

describe("electrum stub", () => {
  it("createElectrumClient throws with #58 pointer", () => {
    expect(() =>
      createElectrumClient({
        endpoint: "wss://example",
        descriptor: DESCRIPTORS.bitcoin,
      }),
    ).toThrow(/#58/);
  });
});

describe("watcher stub", () => {
  it("startWatcher throws with #58 pointer", () => {
    expect(() =>
      startWatcher({
        descriptor: DESCRIPTORS.bitcoin,
        client: {} as never,
        callbacks: {} as never,
      }),
    ).toThrow(/#58/);
  });
});
