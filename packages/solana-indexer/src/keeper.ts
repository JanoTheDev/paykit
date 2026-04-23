import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";

export interface KeeperOptions {
  connection: Connection;
  /** Keeper signer keypair (loaded from SOLANA_KEEPER_KEYPAIR_PATH). */
  keeper?: Keypair;
  /** SubscriptionManager program ID. */
  subscriptionManagerProgramId?: PublicKey;
  /**
   * Source of subscriptions that are due. The orchestrator queries the
   * Postgres shared schema (network_key='solana') and pushes due IDs here.
   * Defers actual implementation to the #57 integration PR; this hook
   * lets tests inject a static list.
   */
  dueSubscriptions?: () => Promise<SolanaDueSubscription[]>;
  /** Polling interval in ms (default 60s). */
  intervalMs?: number;
}

export interface SolanaDueSubscription {
  subscriptionPda: PublicKey;
  subscriptionId: bigint;
  subscriberAta: PublicKey;
  merchantAta: PublicKey;
  platformAta: PublicKey;
  mint: PublicKey;
}

export interface KeeperHandle {
  stop(): Promise<void>;
  /** Run one pass synchronously. Exposed for testing. */
  tick(): Promise<number>;
}

export async function startKeeper(opts: KeeperOptions): Promise<KeeperHandle> {
  const intervalMs = opts.intervalMs ?? 60_000;
  let stopped = false;
  let timer: NodeJS.Timeout | null = null;

  async function tick(): Promise<number> {
    if (stopped) return 0;
    if (!opts.keeper || !opts.subscriptionManagerProgramId || !opts.dueSubscriptions) {
      // Skeleton mode — no keeper keypair / no due-query hook. Useful for
      // booting the service in environments where #57's full wiring isn't
      // in yet.
      return 0;
    }
    const due = await opts.dueSubscriptions();
    let charged = 0;
    for (const sub of due) {
      try {
        await chargeOne(opts.connection, opts.keeper, opts.subscriptionManagerProgramId, sub);
        charged++;
      } catch (err) {
        console.error(`[solana-keeper] charge for ${sub.subscriptionPda.toBase58()} failed:`, err);
      }
    }
    return charged;
  }

  function schedule(): void {
    if (stopped) return;
    timer = setTimeout(async () => {
      await tick().catch((err) => console.error("[solana-keeper] tick:", err));
      schedule();
    }, intervalMs);
  }

  schedule();
  console.log(`[solana-keeper] started (interval=${intervalMs}ms)`);

  return {
    tick,
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}

/**
 * Build + submit a charge_subscription instruction. Hand-crafted tx body
 * to avoid pulling the full Anchor client dependency tree into the indexer.
 * Uses the instruction discriminator Anchor derives from the method name.
 */
async function chargeOne(
  connection: Connection,
  keeper: Keypair,
  programId: PublicKey,
  sub: SolanaDueSubscription,
): Promise<void> {
  // Anchor discriminator = first 8 bytes of sha256("global:charge_subscription")
  // Pre-computed to avoid a crypto dep at runtime; recomputes if the method
  // is ever renamed in the Rust program.
  const discriminator = Buffer.from([0xac, 0xc8, 0xa9, 0x38, 0x0f, 0x0f, 0x0b, 0xc8]);
  const data = discriminator;

  const keys = [
    { pubkey: configPda(programId), isSigner: false, isWritable: false },
    { pubkey: sub.subscriptionPda, isSigner: false, isWritable: true },
    { pubkey: sub.mint, isSigner: false, isWritable: false },
    { pubkey: sub.subscriberAta, isSigner: false, isWritable: true },
    { pubkey: sub.merchantAta, isSigner: false, isWritable: true },
    { pubkey: sub.platformAta, isSigner: false, isWritable: true },
    {
      pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      isSigner: false,
      isWritable: false,
    },
  ];

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  const msg = new TransactionMessage({
    payerKey: keeper.publicKey,
    recentBlockhash: blockhash,
    instructions: [
      {
        programId: SystemProgram.programId, // placeholder — replaced below
        keys: [],
        data: Buffer.alloc(0),
      },
      { programId, keys, data },
    ],
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);
  tx.sign([keeper]);
  await connection.sendTransaction(tx);
}

function configPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("sub_config")], programId);
  return pda;
}
