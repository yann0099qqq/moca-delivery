function normalizeBearer(value: string | null) {
  if (!value?.startsWith("Bearer ")) return "";
  return value.slice(7).trim();
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(hash);
}

export async function isPrintAgentAuthorized(request: Request) {
  const expected = process.env.PRINT_AGENT_TOKEN ?? "";
  const provided = normalizeBearer(request.headers.get("authorization"));
  if (expected.length < 32 || !provided) return false;

  const [expectedHash, providedHash] = await Promise.all([
    digest(expected),
    digest(provided),
  ]);

  if (expectedHash.length !== providedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= expectedHash[index] ^ providedHash[index];
  }
  return difference === 0;
}
