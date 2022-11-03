# Metrics

![image](../images/Nile-text-logo.png)

## Overview

Nile provides a metrics API out-of-the-box because it is critical for any SaaS to be able to measure and monitor consumption and do accurate usage-based billing.
These metrics can be exposed externally to the end user as well as internally for business operations.
Read more on metrics and consumption-based billing in the blog post [Launching an Infrastructure SaaS Product, An Example Walkthrough](https://www.thenile.dev/blog/launch-infra-saas#metrics-and-consumption-based-billing).

This example uses the Nile JS SDK to produce and get metrics about your entity instances.

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Database as a Service](../usecases/DB/) (same as in the Nile Quickstart)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [YOLO](../usecases/README.md#yolo)

## Install Dependencies

Run the following command:

```
yarn install
```

Your output should resemble:

```bash
yarn install v1.22.19
warning package.json: No license field
warning No license field
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
✨  Done in 2.26s.
```

## Setup

You must do all the steps in the [Setup section](../README.md#setup) of the top-level README.md.

:stop_sign: **STOP** :stop_sign: Do not proceed until you have done the above setup :heavy_exclamation_mark:

Then, run the following command to preconfigure the Nile control plane with an entity, organizations, users, and entity instances for the mock usecase, so that you're not starting from scratch.

```bash
yarn setup-nile
```

## Execute

1. List the metric definitions that are available by default (refer to code [src/listMetricDefinitions.ts](src/listMetricDefinitions.ts)).

   ```
   yarn list-metrics
   ```

   Your output should resemble:

   ```json
   {
     "metricDefinitions": [
       {
         "name": "nile.system.DB.instance.accessed",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.created",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.updated",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.deleted",
         "type": "gauge",
         "entityType": "DB"
       }
     ]
   }
   ```

2. Produce a fake measurement for a new metric type called `custom.DB.instance.myMetric` (refer to code [src/putMetrics.ts](src/putMetrics.ts)).

   ```
   yarn put-metric
   ```

   This will generate one measurement that resembles:

   ```json
   [
     {
       "name": "custom.DB.instance.myMetric",
       "type": "gauge",
       "entityType": "DB",
       "measurements": [
         {
           "timestamp": "2022-11-02T18:14:49.759Z",
           "value": 11.8,
           "instanceId": "inst_02rAXw7BAllTLlyPjYWK4k"
         }
       ]
     }
   ]
   ```

3. Get measurements from Nile (refer to code [src/getMetrics.ts](src/getMetrics.ts) which shows two different queries). You should get one measurement for when the instance was created (`nile.system.DB.instance.created`), and one that is what you sent in the previous step (`custom.DB.instance.myMetric`).

   ```
   yarn get-metric
   ```

   The output for the metric `nile.system.DB.instance.created` should resemble:

   ```json
   [
     {
       "name": "nile.system.DB.instance.created",
       "type": "gauge",
       "entityType": "DB",
       "measurements": [
         {
           "timestamp": "2022-10-31T19:49:00.435Z",
           "value": 1,
           "instanceId": "inst_02rAXw7BAllTLlyPjYWK4k"
         }
       ]
     }
   ]
   ```

   The output for the new metric `custom.DB.instance.myMetric` should resemble what was posted in the previous step.

4. List the metric definitions again, which now includes `custom.DB.instance.myMetric`.

   ```
   yarn list-metrics
   ```

   Your output should include what was shown before, plus the new metric:

   ```json
   {
     "metricDefinitions": [
       {
         "name": "nile.system.DB.instance.accessed",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.created",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.updated",
         "type": "gauge",
         "entityType": "DB"
       },
       {
         "name": "nile.system.DB.instance.deleted",
         "type": "gauge",
         "entityType": "DB"
       },
       {                                         <<<<<<<<<<<<<<<
         "name": "custom.DB.instance.myMetric",  <<<<<<<<<<<<<<<
         "type": "gauge",                        <<<<<<<<<<<<<<<
         "entityType": "DB"                      <<<<<<<<<<<<<<<
       }                                         <<<<<<<<<<<<<<<
     ]
   }
   ```

## Next Steps

Run the [webapp](../webapp/) which demonstrates a sample frontend for a SaaS application that integrates with the control plane using Nile React components.
You can see how end users can visualize these metrics for consumption and billing, use a self-serve workflow to create and manage instances, and get built-in multi-tenancy and authorization policies.
