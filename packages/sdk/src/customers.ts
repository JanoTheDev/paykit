import type {
  PaylixConfig,
  CreateCustomerParams,
  UpdateCustomerParams,
  Customer,
  CustomerDetail,
} from "./types";

export async function createCustomer(
  config: PaylixConfig,
  params: CreateCustomerParams
): Promise<Customer> {
  const res = await fetch(`${config.backendUrl}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Failed to create customer (${res.status})`);
  }
  const data = (await res.json()) as { customer: Customer };
  return data.customer;
}

export async function getCustomer(
  config: PaylixConfig,
  id: string
): Promise<CustomerDetail> {
  const res = await fetch(`${config.backendUrl}/api/customers/${id}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Customer not found (${res.status})`);
  }
  return (await res.json()) as CustomerDetail;
}

export async function updateCustomer(
  config: PaylixConfig,
  id: string,
  params: UpdateCustomerParams
): Promise<Customer> {
  const res = await fetch(`${config.backendUrl}/api/customers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Failed to update customer (${res.status})`);
  }
  const data = (await res.json()) as { customer: Customer };
  return data.customer;
}

export async function listCustomers(
  config: PaylixConfig
): Promise<Customer[]> {
  const res = await fetch(`${config.backendUrl}/api/customers`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Failed to list customers (${res.status})`);
  }
  return (await res.json()) as Customer[];
}

export async function deleteCustomer(
  config: PaylixConfig,
  id: string
): Promise<{ ok: true }> {
  const res = await fetch(`${config.backendUrl}/api/customers/${id}/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `Failed to delete customer (${res.status})`);
  }
  return (await res.json()) as { ok: true };
}
