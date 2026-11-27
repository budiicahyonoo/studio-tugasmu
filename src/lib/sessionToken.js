const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }

  return null;
}

/** @param {Uint8Array} bytes */
function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/** @param {string} str */
function fromBase64Url(str) {
  const padded =
    str.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** @param {string} secret */
async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** @param {{sub: string, username?: string, nama?: string}} payload */
export async function signSessionToken(payload, ttlSeconds = 60 * 60 * 24) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET belum dikonfigurasi.");
  }

  const data = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(data)));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload),
  );
  const encodedSignature = toBase64Url(new Uint8Array(signature));
  return `${encodedPayload}.${encodedSignature}`;
}

/** @param {string|null|undefined} token */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const [encodedPayload, encodedSignature] = parts;
  try {
    const key = await importHmacKey(secret);
    const signatureBytes = fromBase64Url(encodedSignature);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(encodedPayload),
    );
    if (!isValid) return null;

    const payloadJson = decoder.decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson);
    if (
      !Number.isFinite(payload?.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      typeof payload.sub !== "string"
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
