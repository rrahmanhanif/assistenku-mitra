const SECRET_KEYS = [
  "token",
  "authorization",
  "password",
  "key",
  "account_number",
  "access_token",
];

function maskString(value) {
  if (typeof value !== "string") return value;
  if (value.length <= 8) return "***";
  const visible = value.slice(-4);
  return `${"*".repeat(Math.min(value.length - 4, 12))}${visible}`;
}

export function maskSensitiveData(payload) {
  if (payload === null || payload === undefined) return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => maskSensitiveData(item));
  }

  if (typeof payload === "object") {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      if (SECRET_KEYS.includes(key.toLowerCase())) {
        acc[key] = maskString(String(value ?? ""));
      } else {
        acc[key] = maskSensitiveData(value);
      }
      return acc;
    }, {});
  }

  if (typeof payload === "string") {
    return maskString(payload);
  }

  return payload;
}
