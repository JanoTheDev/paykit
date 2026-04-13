import type {
  PaylixConfig,
  CreatePortalSessionParams,
  CreatePortalSessionResult,
  ListCustomerInvoicesParams,
  ListCustomerInvoicesResult,
} from "./types";

export async function createPortalSession(
  config: PaylixConfig,
  params: CreatePortalSessionParams
): Promise<CreatePortalSessionResult> {
  const res = await fetch(
    `${config.backendUrl}/api/customers/${params.customerId}/portal-url`,
    { headers: { Authorization: `Bearer ${config.apiKey}` } }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error?: string };
    throw new Error(`Paylix createPortalSession failed: ${err.error || res.statusText}`);
  }
  return (await res.json()) as CreatePortalSessionResult;
}

export async function listCustomerInvoices(
  config: PaylixConfig,
  params: ListCustomerInvoicesParams
): Promise<ListCustomerInvoicesResult> {
  const res = await fetch(
    `${config.backendUrl}/api/customers/${params.customerId}/invoices`,
    { headers: { Authorization: `Bearer ${config.apiKey}` } }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error?: string };
    throw new Error(`Paylix listCustomerInvoices failed: ${err.error || res.statusText}`);
  }
  return (await res.json()) as ListCustomerInvoicesResult;
}
