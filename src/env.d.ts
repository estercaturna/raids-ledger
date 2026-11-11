declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    RESET_HOUR_UTC: string;
    WEEK_ROTATION_TOKEN_HASH?: string;
    ROTATION_ANCHOR_WEEK?: string;
    ROTATION_ANCHOR_NAME?: string;
    ROTATION_OTHER_NAME?: string;
    TEST_MIGRATIONS: unknown;
  }
}
