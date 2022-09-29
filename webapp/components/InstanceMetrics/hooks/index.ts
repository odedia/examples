import Nile, { Measurement, MetricTypeEnum, NileApi } from "@theniledev/js";
import getConfig from "next/config";
import { useRouter } from "next/router";
import useInterval from "global-hooks/useInterval";
import React from "react";
import { useDeveloperNile } from "global-hooks/useDeveloperNile";

type Config = {
  metricName: string,
  intervalTimeMs: number
  measurement: () => Measurement;
}

export const  useMetricsGenerator = (config: Config, cb?: () => void) => {
  const { metricName, intervalTimeMs, measurement } = config;
  const router = useRouter();
  const instanceId = String(router.query.instance);

  const _nile = useDeveloperNile();

  const { publicRuntimeConfig } = getConfig();
  const { 
    NILE_ENTITY_NAME,
  } = publicRuntimeConfig;

  const produceRequestMetrics = React.useCallback(async () =>  {
    const fakeMeasurement = measurement();
    const metricData = {
      name: metricName, 
      type: MetricTypeEnum.Gauge, 
      entityType: NILE_ENTITY_NAME,
      measurements: [fakeMeasurement]
    }

    if (instanceId && _nile) {
      await _nile.metrics.produceBatchOfMetrics({
        metric: [metricData]
      });
      cb && cb();
    }
  }, [NILE_ENTITY_NAME, _nile, cb, instanceId, measurement, metricName]);

  const intervalFn = React.useCallback(() => {
    produceRequestMetrics()
  }, [produceRequestMetrics]);

  useInterval(intervalFn, intervalTimeMs);
}