// Client-side Anchor instruction builders for the Paylix Solana programs.
//
// Mirrors the account layouts declared in each program's lib.rs under
// packages/solana-program/programs/. Rust-side struct changes require a
// lockstep update here. We intentionally skip the Anchor runtime to keep
// the checkout bundle small.

import { sha256 } from "@noble/hashes/sha2.js";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

function anchorDiscriminator(method: string): Buffer {
  return Buffer.from(
    sha256(new TextEncoder().encode(`global:${method}`)),
  ).subarray(0, 8);
}

export const DISCS = {
  create_payment: anchorDiscriminator("create_payment"),
  create_subscription: anchorDiscriminator("create_subscription"),
  charge_subscription: anchorDiscriminator("charge_subscription"),
  cancel_subscription: anchorDiscriminator("cancel_subscription"),
};

export function vaultConfigPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );
  return pda;
}

export function acceptedTokenPda(
  programId: PublicKey,
  mint: PublicKey,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("accepted"), mint.toBuffer()],
    programId,
  );
  return pda;
}

export function subConfigPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sub_config")],
    programId,
  );
  return pda;
}

export function subscriptionPda(
  programId: PublicKey,
  subscriptionId: bigint,
): PublicKey {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(subscriptionId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sub"), idBuf],
    programId,
  );
  return pda;
}

function u64LE(v: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(v);
  return b;
}

function i64LE(v: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(v);
  return b;
}

export interface CreatePaymentArgs {
  programId: PublicKey;
  mint: PublicKey;
  buyer: PublicKey;
  buyerAta: PublicKey;
  merchantAta: PublicKey;
  platformAta: PublicKey;
  amount: bigint;
  productId: Uint8Array; // 32 bytes
  customerId: Uint8Array; // 32 bytes
}

/**
 * paylix_payment_vault.create_payment.
 * Account order must match #[derive(Accounts)] pub struct CreatePayment.
 */
export function buildCreatePaymentIx(args: CreatePaymentArgs): TransactionInstruction {
  if (args.productId.length !== 32 || args.customerId.length !== 32) {
    throw new Error("productId and customerId must be 32-byte arrays");
  }
  const data = Buffer.concat([
    DISCS.create_payment,
    u64LE(args.amount),
    Buffer.from(args.productId),
    Buffer.from(args.customerId),
  ]);
  return new TransactionInstruction({
    programId: args.programId,
    keys: [
      { pubkey: vaultConfigPda(args.programId), isSigner: false, isWritable: false },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      { pubkey: acceptedTokenPda(args.programId, args.mint), isSigner: false, isWritable: false },
      { pubkey: args.buyer, isSigner: true, isWritable: true },
      { pubkey: args.buyerAta, isSigner: false, isWritable: true },
      { pubkey: args.merchantAta, isSigner: false, isWritable: true },
      { pubkey: args.platformAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export interface CreateSubscriptionArgs {
  programId: PublicKey;
  subscriptionId: bigint;
  mint: PublicKey;
  buyer: PublicKey;
  buyerAta: PublicKey;
  merchantAta: PublicKey;
  platformAta: PublicKey;
  amount: bigint;
  intervalSeconds: bigint;
  productId: Uint8Array;
  customerId: Uint8Array;
}

export function buildCreateSubscriptionIx(args: CreateSubscriptionArgs): TransactionInstruction {
  if (args.productId.length !== 32 || args.customerId.length !== 32) {
    throw new Error("productId and customerId must be 32-byte arrays");
  }
  const data = Buffer.concat([
    DISCS.create_subscription,
    u64LE(args.amount),
    i64LE(args.intervalSeconds),
    Buffer.from(args.productId),
    Buffer.from(args.customerId),
  ]);
  return new TransactionInstruction({
    programId: args.programId,
    keys: [
      { pubkey: subConfigPda(args.programId), isSigner: false, isWritable: true },
      { pubkey: subscriptionPda(args.programId, args.subscriptionId), isSigner: false, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      { pubkey: args.buyer, isSigner: true, isWritable: true },
      { pubkey: args.buyerAta, isSigner: false, isWritable: true },
      { pubkey: args.merchantAta, isSigner: false, isWritable: true },
      { pubkey: args.platformAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Build an SPL Token `approve` instruction so the buyer delegates the
 * subscription PDA as spender on their ATA. Needed before createSubscription
 * so the on-chain program can CPI-transfer on every cycle.
 *
 * Keeps the checkout bundle free of @solana/spl-token — manually encoded.
 */
export function buildSplApproveIx(args: {
  source: PublicKey;
  delegate: PublicKey;
  owner: PublicKey;
  amount: bigint;
}): TransactionInstruction {
  // Classic SPL Token Approve instruction: tag=4, u64 amount
  const data = Buffer.concat([Buffer.from([4]), u64LE(args.amount)]);
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: args.source, isSigner: false, isWritable: true },
      { pubkey: args.delegate, isSigner: false, isWritable: false },
      { pubkey: args.owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

/**
 * Derive an associated token account address for (mint, owner). Mirrors
 * @solana/spl-token's getAssociatedTokenAddressSync but avoids the dep.
 */
export function associatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return pda;
}
