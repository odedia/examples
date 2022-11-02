# Authorization

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
This example uses the NILE JS SDK to demonstrate authorization features in Nile in the following workflow:

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

1. Produce a fake measurement (refer to code [src/produce_metrics.ts](src/produce_metrics.ts)).

   ```
   yarn produce
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

2. Consume a measurement (refer to code [src/consume_metrics.ts](src/consume_metrics.ts)). You should get at least one measurement that is what you sent in the previous step.

   ```
   yarn consume
   ```
