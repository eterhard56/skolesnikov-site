type SessionPayload = {
  sub: "parser";
  iat: number;
  exp: number;
};

function base64UrlToBytes(value: string): Uint8Array {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifySessionTokenEdge(
  token: string,
  secret: string
): Promise<boolean> {
  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = base64UrlToBytes(signature);
  const dataBytes = new TextEncoder().encode(data);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(sigBytes),
    Uint8Array.from(dataBytes)
  );
  if (!valid) return false;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(data));
    const payload = JSON.parse(json) as SessionPayload;
    return payload.sub === "parser" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
