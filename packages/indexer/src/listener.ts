import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { base, baseSepolia } from "viem/chains";
import { config } from "./config";
import { getLastBlock, setLastBlock } from "./cursor";
import {
  handlePaymentReceived,
  handleSubscriptionCreated,
  handleSubscriptionPaymentReceived,
  handleSubscriptionPastDue,
  handleSubscriptionCancelled,
} from "./handlers";

const paymentReceivedEvent = parseAbiItem(
  "event PaymentReceived(address indexed payer, address indexed merchant, address token, uint256 amount, uint256 fee, bytes32 productId, bytes32 customerId, uint256 timestamp)"
);

const subscriptionCreatedEvent = parseAbiItem(
  "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, address indexed merchant, address token, uint256 amount, uint256 interval, bytes32 productId, bytes32 customerId)"
);

const subscriptionPaymentReceivedEvent = parseAbiItem(
  "event PaymentReceived(uint256 indexed subscriptionId, address indexed subscriber, address indexed merchant, address token, uint256 amount, uint256 fee, uint256 timestamp)"
);

const subscriptionPastDueEvent = parseAbiItem(
  "event SubscriptionPastDue(uint256 indexed subscriptionId)"
);

const subscriptionCancelledEvent = parseAbiItem(
  "event SubscriptionCancelled(uint256 indexed subscriptionId)"
);

function getChain() {
  return config.network === "base" ? base : baseSepolia;
}

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return /429|rate limit|too many requests|exceeded|throttle/i.test(msg);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Wraps an RPC call with exponential backoff on rate-limit errors. Non-rate-limit
 * errors are thrown immediately so they can be handled as genuine failures.
 */
async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 6
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (!isRateLimitError(err) || attempt >= maxAttempts) throw err;
      const delayMs = Math.min(30_000, 500 * 2 ** (attempt - 1));
      console.warn(
        `[Listener] ${label}: rate-limited, backing off ${delayMs}ms (attempt ${attempt}/${maxAttempts})`
      );
      await sleep(delayMs);
    }
  }
}

type ContractSpec = {
  key: string;
  address: `0x${string}`;
  event: ReturnType<typeof parseAbiItem>;
  eventName: string;
  handle: (log: Log, args: any) => Promise<void>;
};

export async function startListener() {
  const chain = getChain();

  // Live-watcher poll interval — each watchContractEvent polls independently, so
  // with N watchers the effective getLogs rate is N / pollingInterval. Keep this
  // conservative for free RPC tiers.
  const livePollMs = parseInt(process.env.RPC_POLL_INTERVAL_MS || "12000", 10);

  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
    pollingInterval: livePollMs,
  });

  console.log(`[Listener] Watching events on ${chain.name}...`);
  console.log(`[Listener] PaymentVault: ${config.paymentVaultAddress}`);
  console.log(`[Listener] SubscriptionManager: ${config.subscriptionManagerAddress}`);

  const contracts: ContractSpec[] = [
    {
      key: "payment_vault_payment_received",
      address: config.paymentVaultAddress,
      event: paymentReceivedEvent,
      eventName: "PaymentReceived",
      handle: (log, args) => handlePaymentReceived(log, args),
    },
    {
      key: "subscription_manager_subscription_created",
      address: config.subscriptionManagerAddress,
      event: subscriptionCreatedEvent,
      eventName: "SubscriptionCreated",
      handle: (log, args) => handleSubscriptionCreated(log, args),
    },
    {
      key: "subscription_manager_payment_received",
      address: config.subscriptionManagerAddress,
      event: subscriptionPaymentReceivedEvent,
      eventName: "PaymentReceived",
      handle: (log, args) => handleSubscriptionPaymentReceived(log, args),
    },
    {
      key: "subscription_manager_subscription_past_due",
      address: config.subscriptionManagerAddress,
      event: subscriptionPastDueEvent,
      eventName: "SubscriptionPastDue",
      handle: (log, args) => handleSubscriptionPastDue(log, args),
    },
    {
      key: "subscription_manager_subscription_cancelled",
      address: config.subscriptionManagerAddress,
      event: subscriptionCancelledEvent,
      eventName: "SubscriptionCancelled",
      handle: (log, args) => handleSubscriptionCancelled(log, args),
    },
  ];

  const currentBlock = await client.getBlockNumber();
  console.log(`[Listener] Current block: ${currentBlock}`);

  // Chunk size for backfill — Alchemy free tier limits eth_getLogs to 10 blocks.
  // Tunable via env for paid plans.
  const BACKFILL_CHUNK = BigInt(
    parseInt(process.env.BACKFILL_CHUNK_SIZE || "10", 10)
  );
  // Cap total blocks to backfill on cold start (avoid hammering RPC after long downtime).
  const MAX_BACKFILL_BLOCKS = BigInt(
    parseInt(process.env.MAX_BACKFILL_BLOCKS || "5000", 10)
  );
  // Delay between backfill chunks to stay under free-tier CU/sec budgets.
  const BACKFILL_DELAY_MS = parseInt(
    process.env.BACKFILL_DELAY_MS || "250",
    10
  );

  // Backfill each contract up to the current block.
  for (const spec of contracts) {
    try {
      const lastBlock = await getLastBlock(spec.key);
      let fromBlock = lastBlock !== null ? lastBlock + 1n : currentBlock;

      // Cap how far back we go on first run / after long downtime.
      if (currentBlock - fromBlock > MAX_BACKFILL_BLOCKS) {
        fromBlock = currentBlock - MAX_BACKFILL_BLOCKS;
        console.log(
          `[Listener] ${spec.key}: capped backfill window to last ${MAX_BACKFILL_BLOCKS} blocks`
        );
      }

      if (fromBlock > currentBlock) {
        console.log(
          `[Listener] ${spec.key}: cursor ${lastBlock} ahead of head ${currentBlock}, nothing to backfill`
        );
        await setLastBlock(spec.key, currentBlock);
        continue;
      }

      console.log(
        `[Listener] ${spec.key}: backfilling ${fromBlock} -> ${currentBlock} (chunk size ${BACKFILL_CHUNK})`
      );

      let totalLogs = 0;
      let cursor = fromBlock;

      while (cursor <= currentBlock) {
        const chunkEnd =
          cursor + BACKFILL_CHUNK - 1n > currentBlock
            ? currentBlock
            : cursor + BACKFILL_CHUNK - 1n;

        try {
          const logs = await withRateLimitRetry(
            () =>
              client.getLogs({
                address: spec.address,
                event: spec.event as any,
                fromBlock: cursor,
                toBlock: chunkEnd,
              }),
            `${spec.key} ${cursor}-${chunkEnd}`
          );

          totalLogs += logs.length;

          for (const log of logs) {
            try {
              await spec.handle(log as Log, (log as any).args);
            } catch (err) {
              console.error(
                `[Listener] Error handling backfilled ${spec.eventName}:`,
                err
              );
            }
          }

          // Advance cursor AFTER successful chunk so a failure mid-backfill
          // doesn't lose progress on the next startup.
          await setLastBlock(spec.key, chunkEnd);
        } catch (err) {
          if (isRateLimitError(err)) {
            // Don't advance the cursor on persistent rate-limit failures — that
            // would permanently drop events. Bail out of this contract's backfill
            // and let the next startup retry from the same cursor.
            console.error(
              `[Listener] Chunk ${cursor}-${chunkEnd} for ${spec.key} still rate-limited after retries, stopping backfill for this contract`
            );
            break;
          }
          console.error(
            `[Listener] Chunk ${cursor}-${chunkEnd} failed for ${spec.key}, skipping:`,
            err instanceof Error ? err.message : err
          );
          // Genuine poisoned chunk — advance so we don't get stuck on it.
          await setLastBlock(spec.key, chunkEnd);
        }

        cursor = chunkEnd + 1n;
        if (BACKFILL_DELAY_MS > 0) await sleep(BACKFILL_DELAY_MS);
      }

      console.log(
        `[Listener] ${spec.key}: backfill complete (${totalLogs} events)`
      );
    } catch (err) {
      console.error(`[Listener] Backfill failed for ${spec.key}:`, err);
    }
  }

  // Start live watchers.
  for (const spec of contracts) {
    client.watchContractEvent({
      address: spec.address,
      abi: [spec.event],
      eventName: spec.eventName,
      onLogs: (logs) => {
        (async () => {
          for (const log of logs) {
            try {
              await spec.handle(log as Log, (log as any).args);
              if ((log as Log).blockNumber) {
                await setLastBlock(
                  spec.key,
                  (log as Log).blockNumber as bigint
                );
              }
            } catch (err) {
              console.error(
                `[Listener] Error handling ${spec.eventName}:`,
                err
              );
            }
          }
        })().catch((err) =>
          console.error(`[Listener] onLogs dispatch error (${spec.key}):`, err)
        );
      },
      onError: (err) => {
        console.error(`[Listener] watch error (${spec.key}):`, err);
      },
    });
  }

  console.log("[Listener] All event watchers started.");
}
