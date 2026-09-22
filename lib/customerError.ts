/**
 * Converts any thrown error into a message safe to show a customer.
 * The real, technical error is always logged to the console for
 * debugging, it is never what gets displayed in the UI.
 *
 * Used everywhere a customer-facing action (checkout, payment, order
 * lookup) can fail: raw fetch/network errors, raw Supabase/Postgres
 * messages, and raw Paystack errors should never reach the screen
 * as-is, only ever this translated, friendly text.
 */
export function toCustomerMessage(err: unknown, fallback?: string): string {
  // eslint-disable-next-line no-console
  console.error("[customer-facing error]", err);

  const raw = err instanceof Error ? err.message : String(err);

  // fetch() throws exactly this (or a close variant) when the request
  // never reached the server at all, no internet, DNS failure, the
  // server is unreachable, etc. This is the literal "Failed to fetch"
  // case that should never surface verbatim to a customer.
  if (
    /failed to fetch|networkerror|load failed|network request failed|ERR_INTERNET_DISCONNECTED/i.test(
      raw
    )
  ) {
    return "We couldn't connect to the server. Please check your internet connection and try again.";
  }

  // Stock ran out between browsing and paying, this message is
  // already written to be shown as-is, just strip the internal prefix.
  if (raw.startsWith("INSUFFICIENT_STOCK")) {
    return `Sorry, one of your cart items just sold out: ${raw.replace(
      "INSUFFICIENT_STOCK: ",
      ""
    )}. Please update your cart and try again.`;
  }

  // Anything that looks like a database/SDK/internal error, or is
  // simply too long to plausibly be a message we wrote ourselves for
  // a customer to read, gets replaced with a generic apology instead
  // of ever being shown verbatim.
  const looksTechnical =
    /postgres|supabase|relation|column|constraint|syntax error|null value|duplicate key|jwt|rpc|stack trace|undefined is not|cannot read propert|permission denied|paystack.*(error|invalid)/i.test(
      raw
    );

  if (looksTechnical || raw.length > 160) {
    return (
      fallback ??
      "Something went wrong on our end. Please try again in a moment, or contact us if this continues."
    );
  }

  // Short messages that don't match any of the above are ones we
  // wrote ourselves to be customer-readable already (e.g. "Payment
  // could not be verified."), safe to show directly.
  return raw;
}
