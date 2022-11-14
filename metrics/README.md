# Metrics

![image](../images/Nile-text-logo.png)

## Overview

Nile provides a metrics API and matching UI components.
This allows you to add real-time data features to your application, for example, each end user of your SaaS can see their real-time resource consumption and the cost incurred to date.
Read more on the importance of metrics and consumption-based billing in the blog post [Launching an Infrastructure SaaS Product, An Example Walkthrough](https://www.thenile.dev/blog/launch-infra-saas#metrics-and-consumption-based-billing).

This example uses the Nile JS SDK to produce and filter metrics for your entity instances.

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

The default scenario in these examples is a company that provides a database as SaaS.
But you can modify the `NILE_ENTITY_NAME` parameter in your `.env` file to change it to be any other type of service offering (see [Advanced](../README.md#advanced)).

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

Note: the outputs below assume that `NILE_ENTITY_NAME=DB`.  If you are running the example with another entity type, your output may differ.

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

2. Produce a fake measurement for a new metric type called `custom.DB.instance.myMetric` (refer to code [src/produceMetrics.ts](src/produceMetrics.ts)).

   ```
   yarn produce-metrics
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
           "value": 81.82,
           "instanceId": "inst_02rAXw7BAllTLlyPjYWK4k"
         }
       ]
     }
   ]
   ```

3. Filter measurements from Nile (refer to code [src/filterMetrics.ts](src/filterMetrics.ts) which shows two different queries). In this example, you should get one measurement for when the instance was created (`nile.system.DB.instance.created`), and one or more measurements that were produced in the last 4 hours (the time range is configurable) including what you produced in the previous step (`custom.DB.instance.myMetric`).

   ```
   yarn filter-metrics
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
