import * as DbMetrics from './DB';

type Metrics = {
  gaugeGraph: string[];
  lineChart: string[];
  averageNum: string[];
};
export const getMetrics = (entity: string): void | Metrics => {
  return DbMetrics;
};
