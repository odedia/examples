type Metrics = {
  gaugeGraph: string[];
  lineChart: string[];
  averageNum: string[];
};
export const getMetrics = (entity: string): void | Metrics => {
  try {
    const entityModuleMetrics = require(`./${entity}/index.ts`);
    return entityModuleMetrics;
  } catch (err) {
    console.error(err);
    console.error(`Did you check that webapp/metrics/${entity}/index.ts exists?`);
  }
};
