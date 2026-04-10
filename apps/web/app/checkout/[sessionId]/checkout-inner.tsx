"use client";

import { CheckoutProviders } from "@/components/providers";
import { CheckoutClient } from "./checkout-client";

export function CheckoutInner(props: React.ComponentProps<typeof CheckoutClient>) {
  return (
    <CheckoutProviders>
      <CheckoutClient {...props} />
    </CheckoutProviders>
  );
}
