const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // per identity
const clientBuckets = new Map();

const CACHE_KEY = "gateway_client_identity";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedIdentity() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
      return parsed.value;
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveClientIp() {
  const cached = getCachedIdentity();
  if (cached) return cached;

  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ value: ip, cachedAt: Date.now() })
    );

    return ip;
  } catch {
    // Fallback: identitas berbasis device
    const fallback = `device-${btoa(navigator.userAgent).slice(0, 8)}`;

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ value: fallback, cachedAt: Date.now() })
    );

    return fallback;
  }
}

function assertRateLimit(identity) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const history = clientBuckets.get(identity) || [];
  const recent = history.filter((ts) => ts > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const error = new Error("Rate limit gateway tercapai");
    error.retryAfter = Math.ceil(
      (recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000
    );
    throw error;
  }

  recent.push(now);
  clientBuckets.set(identity, recent);
}

export async function gatewayFetch(path, options = {}) {
  const {
    userId,
    ipOverride,
    baseUrl = import.meta.env.VITE_GATEWAY_URL,
    ...fetchOptions
  } = options;

  const identity = userId || ipOverride || (await resolveClientIp());
  assertRateLimit(identity);

  const targetUrl = baseUrl
    ? new URL(path, baseUrl).toString()
    : path;

  return fetch(targetUrl, fetchOptions);
}
