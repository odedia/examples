// const definitions for the demo
export const iteration_id = process.argv.slice(2) != "" ? process.argv.slice(2) : "";
export const NILE_URL = process.env.NILE_URL || "https://prod.thenile.dev";
export const NILE_WORKSPACE = `demo-test-dw${iteration_id}`
export const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL || `dev-mary${iteration_id}@dw.demo`
export const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD || "password"
export const NILE_TENANT_EMAIL=`tenant-nora${iteration_id}@customer.io`
export const NILE_TENANT_PASSWORD="password"
export const NILE_TENANT_NAME = `Tenant${iteration_id}`
