"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/paykit";

export default function NewProductPage() {
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
      <PageHeader title="Create Product" />
      <ProductForm mode="create" />
    </PageShell>
  );
}
