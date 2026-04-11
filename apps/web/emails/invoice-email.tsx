import { createElement } from "react";

export interface InvoiceEmailProps {
  invoiceNumber: string;
  merchantName: string;
  totalCents: number;
  currency: string;
  hostedUrl: string;
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function InvoiceEmail(props: InvoiceEmailProps) {
  return createElement(
    "div",
    {
      style: {
        fontFamily: "system-ui, sans-serif",
        color: "#0b0b0f",
        lineHeight: 1.5,
      },
    },
    createElement(
      "h1",
      { style: { fontSize: 18 } },
      `Invoice ${props.invoiceNumber}`,
    ),
    createElement("p", null, `From ${props.merchantName}`),
    createElement(
      "p",
      null,
      `Total: ${formatMoney(props.totalCents, props.currency)}`,
    ),
    createElement(
      "p",
      null,
      createElement(
        "a",
        { href: props.hostedUrl, style: { color: "#06d6a0" } },
        "View invoice",
      ),
    ),
  );
}
