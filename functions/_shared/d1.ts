/**
 * Minimal structural types for the D1 binding.
 *
 * Deliberately hand-written rather than pulling in @cloudflare/workers-types:
 * the project type-checks with the DOM lib, and a full workers-types install
 * would conflict with the browser globals the React side depends on.
 */
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
