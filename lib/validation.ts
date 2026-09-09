// Basic Nigerian phone number validation.
// Accepts: 08012345678 (11 digits starting with 0)
// or +2348012345678 / 2348012345678 (country code + 10 digits)
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(0\d{10}|\+?234\d{10})$/.test(cleaned);
}

// A delivery address should be more than a couple of characters,
// this just catches obviously incomplete input like "a" or "no".
export function isValidAddress(address: string): boolean {
  return address.trim().length >= 8;
}
