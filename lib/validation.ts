// Accepts local-format numbers (0 followed by 8-10 digits, covering
// Nigeria's 11-digit total, and the 10-digit total used by Ghana, Kenya,
// South Africa, and most other African countries) or full international
// format (+ followed by 8-15 digits, covering any country's code). This
// isn't tied to Nigeria and Ghana specifically, a customer from any
// African country (or elsewhere) can check out with their own number.
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  const local = /^0\d{8,10}$/;
  const international = /^\+\d{8,15}$/;
  return local.test(cleaned) || international.test(cleaned);
}

// The pickup area/landmark just needs to be more than a couple of
// characters, this catches obviously incomplete input like "a" or "no".
export function isValidArea(area: string): boolean {
  return area.trim().length >= 3;
}

// Simple, deliberately permissive check, just enough to catch obviously
// incomplete input, Paystack itself will reject a genuinely invalid one.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
