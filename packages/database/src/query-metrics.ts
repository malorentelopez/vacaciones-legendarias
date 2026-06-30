import { AsyncLocalStorage } from "node:async_hooks";

export type QueryMetrics = {
  queryCount: number;
  queries: string[];
};

const queryMetricsStorage = new AsyncLocalStorage<QueryMetrics>();

export function isQueryMetricsEnabled(): boolean {
  return process.env.PRISMA_QUERY_METRICS === "1";
}

export function getQueryMetrics(): QueryMetrics | undefined {
  return queryMetricsStorage.getStore();
}

export function recordQuery(model: string, operation: string): void {
  const store = queryMetricsStorage.getStore();
  if (!store) return;
  store.queryCount += 1;
  if (store.queries.length < 200) {
    store.queries.push(`${model}.${operation}`);
  }
}

export async function runWithQueryMetrics<T>(
  fn: () => Promise<T>
): Promise<{ result: T; metrics: QueryMetrics }> {
  const metrics: QueryMetrics = { queryCount: 0, queries: [] };
  const result = await queryMetricsStorage.run(metrics, fn);
  return { result, metrics };
}
