// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop?: any;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window !== "undefined" && window.PaystackPop) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Paystack."));
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function openPaystackCheckout(options: {
  email: string;
  amountKobo: number;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}): Promise<void> {
  await loadPaystackScript();

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  console.log("Paystack public key status:", {
    exists: Boolean(publicKey),
    type: publicKey?.startsWith("pk_test_")
      ? "test"
      : publicKey?.startsWith("pk_live_")
        ? "live"
        : "invalid-or-unknown",
  });

  if (!publicKey) {
    throw new Error("Payment is not configured yet.");
  }

  const handler = window.PaystackPop!.setup({
    key: publicKey,
    email: options.email,
    amount: options.amountKobo,
    currency: "NGN",
    callback: (response: { reference: string }) => {
      options.onSuccess(response.reference);
    },
    onClose: () => {
      options.onClose();
    },
  });

  handler.openIframe();
}
