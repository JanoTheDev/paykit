import { describe, it, expect } from "vitest";
import { classifyTrialConversionError, isTerminal } from "../trial-error-classifier";

describe("classifyTrialConversionError", () => {
  it("classifies insufficient balance", () => {
    const err = new Error("ERC20: transfer amount exceeds balance");
    expect(classifyTrialConversionError(err)).toBe("insufficient_balance");
  });

  it("classifies expired permit", () => {
    const err = new Error("ERC20Permit: expired deadline");
    expect(classifyTrialConversionError(err)).toBe("permit_expired");
  });

  it("classifies nonce drift via IntentAlreadyUsed selector", () => {
    const err = new Error("reverted with custom error 'IntentAlreadyUsed()'");
    expect(classifyTrialConversionError(err)).toBe("nonce_drift");
  });

  it("classifies allowance revoked", () => {
    const err = new Error("ERC20: insufficient allowance");
    expect(classifyTrialConversionError(err)).toBe("allowance_revoked");
  });

  it("falls back to unknown for unrecognized messages", () => {
    expect(classifyTrialConversionError(new Error("some weird rpc failure"))).toBe("unknown");
  });

  it("handles non-Error inputs", () => {
    expect(classifyTrialConversionError("string error")).toBe("unknown");
    expect(classifyTrialConversionError(null)).toBe("unknown");
    expect(classifyTrialConversionError(undefined)).toBe("unknown");
    expect(classifyTrialConversionError({})).toBe("unknown");
  });
});

describe("isTerminal", () => {
  it("treats permit_expired, nonce_drift, and allowance_revoked as terminal", () => {
    expect(isTerminal("permit_expired")).toBe(true);
    expect(isTerminal("nonce_drift")).toBe(true);
    expect(isTerminal("allowance_revoked")).toBe(true);
  });

  it("treats insufficient_balance and unknown as retriable", () => {
    expect(isTerminal("insufficient_balance")).toBe(false);
    expect(isTerminal("unknown")).toBe(false);
  });
});
