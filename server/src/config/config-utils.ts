/**
 * Configuration utility functions
 */

/**
 * List of keys that contain sensitive data and should be redacted in logs
 */
const SENSITIVE_KEYS = [
  'password',
  'secret',
  'secretKey',
  'webhookSecret',
  'clientSecret',
  'betterAuthSecret',
  'stripeKey',
  'apiKey',
  'token',
  'accessToken',
  'refreshToken',
  'privateKey',
];

/**
 * Redacts sensitive values from an object before logging.
 * Recursively traverses nested objects.
 *
 * @example
 * ```ts
 * const safeConfig = redactSecrets(config);
 * console.log(safeConfig); // { password: '[REDACTED]', name: 'app' }
 * ```
 */
export function redactSecrets<T extends object>(obj: T): T {
  const result = JSON.parse(
    JSON.stringify(obj, (key, value: unknown) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(
        (sensitiveKey) =>
          lowerKey.includes(sensitiveKey.toLowerCase()) ||
          lowerKey === sensitiveKey.toLowerCase(),
      );

      if (isSensitive && typeof value === 'string') {
        return '[REDACTED]';
      }
      return value;
    }),
  ) as T;
  return result;
}

/**
 * Parses a comma-separated string into an array of trimmed strings.
 *
 * @example
 * ```ts
 * parseCommaSeparated('a, b, c') // ['a', 'b', 'c']
 * ```
 */
export function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
