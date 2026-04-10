import { createPublicClient, http, parseAbiItem } from "viem";
import { base, baseSepolia } from "viem/chains";
import { config } from "./config";
import {
  handlePaymentReceived,
  handleSubscriptionCreated,
  handleSubscriptionPastDue,
  handleSubscriptionCancelled,
} from "./handlers";

const paymentReceivedEvent = parseAbiItem(
  "event PaymentReceived(address indexed payer, address indexed merchant, address token, uint256 amount, uint256 fee, bytes32 productId, bytes32 customerId, uint256 timestamp)"
);

const subscriptionCreatedEvent = parseAbiItem(
  "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, address indexed merchant, address token, uint256 amount, uint256 interval)"
);

const subscriptionPaymentReceivedEvent = parseAbiItem(
  "event PaymentReceived(uint256 indexed subscriptionId, address indexed subscriber, uint256 amount, uint256 timestamp)"
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

export async function startListener() {
  const chain = getChain();

  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  console.log(`[Listener] Watching events on ${chain.name}...`);
  console.log(`[Listener] PaymentVault: ${config.paymentVaultAddress}`);
  console.log(`[Listener] SubscriptionManager: ${config.subscriptionManagerAddress}`);

  // Watch PaymentVault: PaymentReceived
  client.watchContractEvent({
    address: config.paymentVaultAddress,
    abi: [paymentReceivedEvent],
    eventName: "PaymentReceived",
    onLogs: (logs) => {
      for (const log of logs) {
        handlePaymentReceived(log, log.args as any).catch((err) =>
          console.error("[Listener] Error handling PaymentReceived:", err)
        );
      }
    },
  });

  // Watch SubscriptionManager: SubscriptionCreated
  client.watchContractEvent({
    address: config.subscriptionManagerAddress,
    abi: [subscriptionCreatedEvent],
    eventName: "SubscriptionCreated",
    onLogs: (logs) => {
      for (const log of logs) {
        handleSubscriptionCreated(log, log.args as any).catch((err) =>
          console.error("[Listener] Error handling SubscriptionCreated:", err)
        );
      }
    },
  });

  // Watch SubscriptionManager: SubscriptionPastDue
  client.watchContractEvent({
    address: config.subscriptionManagerAddress,
    abi: [subscriptionPastDueEvent],
    eventName: "SubscriptionPastDue",
    onLogs: (logs) => {
      for (const log of logs) {
        handleSubscriptionPastDue(log, log.args as any).catch((err) =>
          console.error("[Listener] Error handling SubscriptionPastDue:", err)
        );
      }
    },
  });

  // Watch SubscriptionManager: SubscriptionCancelled
  client.watchContractEvent({
    address: config.subscriptionManagerAddress,
    abi: [subscriptionCancelledEvent],
    eventName: "SubscriptionCancelled",
    onLogs: (logs) => {
      for (const log of logs) {
        handleSubscriptionCancelled(log, log.args as any).catch((err) =>
          console.error("[Listener] Error handling SubscriptionCancelled:", err)
        );
      }
    },
  });

  console.log("[Listener] All event watchers started.");
}
