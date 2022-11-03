# Metrics

![image](../images/Nile-text-logo.png)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Database as a Service](../usecases/DB/) (same as in the Nile Quickstart)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [YOLO](../usecases/README.md#yolo)

For this service, you can use Nile's built-in metrics to produce and consume metrics about your instances.
This example uses the NILE JS SDK to demonstrate metrics features in Nile.

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

1. List the metric definitions that are available by default.

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

2. Produce a fake measurement for a new metric type called `myMetric` (refer to code [src/putMetrics.ts](src/putMetrics.ts)).

   ```
   yarn put-metric
   ```

   This will generate one measurement that resembles:

   ```json
   [
     {
       "name": "myMetric",
       "type": "gauge",
       "entityType": "DB",
       "measurements": [
         {
           "timestamp": "2022-11-02T18:14:49.759Z",
           "value": 11.8,
           "instanceId": "inst_02rPXw8BAllTLlyPjYWK7k"
         }
       ]
     }
   ]
   ```

3. Consume measurements from Nile (refer to code [src/getMetrics.ts](src/getMetrics.ts) which shows two different queries). You should get one measurement for when the instance was created (`nile.system.DB.instance.created`), and one that is what you sent in the previous step (`myMetric`).

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
           "instanceId": "inst_02rOtB9uGvJTn4gNrPocfU"
         }
       ]
     }
   ]
   ```

   The output for the new metric `myMetric` should resemble what was posted in the previous step.

4. List the metric definitions again, which now includes `myMetric`.

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
       {                          <<<<<<<<<<<<<<<
         "name": "myMetric",      <<<<<<<<<<<<<<<
         "type": "gauge",         <<<<<<<<<<<<<<<
         "entityType": "DB"       <<<<<<<<<<<<<<<
       }                          <<<<<<<<<<<<<<<
     ]
   }
   ```
