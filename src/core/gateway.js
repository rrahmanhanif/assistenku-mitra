const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

const clientBuckets = new Map();

async function resolveClientIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = await res.json();
    return json.ip || "unknown";
  } catch {
    return "unknown";
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
    baseUrl = import.meta.env.VITE_API_BASE_URL,
    ...fetchOptions
  } = options;

  const identity = userId || ipOverride || (await resolveClientIp());
  assertRateLimit(identity);

  const targetUrl = baseUrl
    ? new URL(path, baseUrl).toString()
    : path;

  return fetch(targetUrl, fetchOptions);
}
