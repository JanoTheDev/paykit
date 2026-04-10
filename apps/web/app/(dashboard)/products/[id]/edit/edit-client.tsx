"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm, type ProductFormData } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, CopyableField } from "@/components/paykit";

interface EditProductClientProps {
  product: ProductFormData & { id: string };
}

export function EditProductClient({ product }: EditProductClientProps) {
  return (
    <PageShell size="sm">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </Button>
      </div>
      <PageHeader title="Edit Product" />
      <CopyableField label="Product ID" value={product.id} />
      <ProductForm mode="edit" initialData={product} />
    </PageShell>
  );
}
