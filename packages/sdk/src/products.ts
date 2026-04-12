import type {
  PaylixConfig,
  CreateProductParams,
  UpdateProductParams,
  Product,
} from "./types";

export async function createProduct(
  config: PaylixConfig,
  params: CreateProductParams
): Promise<Product> {
  const res = await fetch(`${config.backendUrl}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Failed to create product (${res.status})`);
  }
  return res.json();
}

export async function getProduct(
  config: PaylixConfig,
  id: string
): Promise<Product> {
  const res = await fetch(`${config.backendUrl}/api/products/${id}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Product not found (${res.status})`);
  }
  return res.json();
}

export async function updateProduct(
  config: PaylixConfig,
  id: string,
  params: UpdateProductParams
): Promise<Product> {
  const res = await fetch(`${config.backendUrl}/api/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Failed to update product (${res.status})`);
  }
  return res.json();
}

export async function listProducts(
  config: PaylixConfig
): Promise<Product[]> {
  const res = await fetch(`${config.backendUrl}/api/products`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Failed to list products (${res.status})`);
  }
  return res.json();
}
