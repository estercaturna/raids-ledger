declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    RESET_HOUR_UTC: string;
    TEST_MIGRATIONS: unknown;
  }
}
