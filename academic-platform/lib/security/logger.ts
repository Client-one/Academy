/**
 * Centralized safe logging. Never log passwords, tokens, cookies,
 * authorization headers, secret keys, or signed URLs.
 */

const SENSITIVE_KEY =
  /password|token|secret|api[_-]?key|authorization|cookie|service[_-]?role|signed[_-]?url/i;

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth-limit]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    // Redact anything that looks like a JWT or a Supabase signed URL token
    if (/eyJ[A-Za-z0-9_-]{10,}/.test(value) || /token=/.test(value)) {
      return "[REDACTED]";
    }
    return value.length > 500 ? value.slice(0, 500) + "…" : value;
  }
  if (Array.isArray(value)) return value.map((v) => redactValue(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? "[REDACTED]" : redactValue(v, depth + 1);
    }
    return out;
  }
  return value;
}

type Meta = Record<string, unknown> | undefined;

function emit(level: "info" | "error", event: string, meta: Meta) {
  const line = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta ? (redactValue(meta) as Record<string, unknown>) : {}),
  };
  const serialized = JSON.stringify(line);
  if (level === "error") console.error(serialized);
  else console.log(serialized);
}

export function logInfo(event: string, meta?: Meta) {
  emit("info", event, meta);
}

export function logError(event: string, meta?: Meta) {
  emit("error", event, meta);
}
