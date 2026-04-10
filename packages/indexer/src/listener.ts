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

type ContractSpec = {
  key: string;
  address: `0x${string}`;
  event: ReturnType<typeof parseAbiItem>;
  eventName: string;
  handle: (log: Log, args: any) => Promise<void>;
};

export async function startListener() {
  const chain = getChain();

  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
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

  // Backfill each contract up to the current block.
  for (const spec of contracts) {
    try {
      const lastBlock = await getLastBlock(spec.key);
      const fromBlock = lastBlock !== null ? lastBlock + 1n : currentBlock;

      if (fromBlock > currentBlock) {
        console.log(
          `[Listener] ${spec.key}: cursor ${lastBlock} ahead of head ${currentBlock}, nothing to backfill`
        );
      } else {
        console.log(
          `[Listener] ${spec.key}: backfilling ${fromBlock} -> ${currentBlock}`
        );

        const logs = await client.getLogs({
          address: spec.address,
          event: spec.event as any,
          fromBlock,
          toBlock: currentBlock,
        });

        console.log(
          `[Listener] ${spec.key}: ${logs.length} backfilled events`
        );

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
      }

      await setLastBlock(spec.key, currentBlock);
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
