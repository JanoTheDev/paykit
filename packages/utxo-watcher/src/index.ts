export {
  DESCRIPTORS,
  getDescriptor,
  type UtxoChainKey,
  type UtxoChainDescriptor,
  type UtxoNetworkMagic,
} from "./descriptors";
export {
  deriveSessionAddress,
  validateXpub,
  type DerivedAddress,
  type Xpub,
} from "./hd";
export {
  createElectrumClient,
  type ElectrumClient,
  type ElectrumClientOptions,
  type ElectrumHistoryEntry,
  type AddressPaymentHit,
} from "./electrum";
export {
  startWatcher,
  type WatcherOptions,
  type WatcherHandle,
  type WatcherSession,
  type WatcherCallbacks,
} from "./watcher";
