import { createElement } from "react";

export interface CheckoutAbandonedEmailProps {
  productName: string;
  restartUrl: string;
  merchantName: string | null;
}

export function CheckoutAbandonedEmail(props: CheckoutAbandonedEmailProps) {
  return createElement(
    "div",
    {
      style: {
        fontFamily: "system-ui, sans-serif",
        color: "#0b0b0f",
        lineHeight: 1.5,
      },
    },
    createElement("h1", { style: { fontSize: 18 } }, "Still interested?"),
    createElement(
      "p",
      null,
      `You left your ${props.productName} checkout before finishing. Your session is saved — pick up where you left off:`,
    ),
    createElement(
      "p",
      null,
      createElement(
        "a",
        {
          href: props.restartUrl,
          style: {
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 8,
            background: "#06d6a0",
            color: "#07070a",
            textDecoration: "none",
            fontWeight: 600,
          },
        },
        "Resume checkout",
      ),
    ),
    props.merchantName
      ? createElement(
          "p",
          { style: { color: "#6b7280", fontSize: 13 } },
          `Sent by ${props.merchantName} via Paylix.`,
        )
      : null,
  );
}
