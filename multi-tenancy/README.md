# Multi-tenancy

![image](../images/Nile-text-logo.png)

## Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Run](#run)
* [Next steps](#next-steps)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/multi-tenancy.png)

This example demonstrates multi-tenancy with multiple organizations and isolated users within each organization.
It sets up the following control plane in Nile:

- Sign up a new developer
- Create a workspace, which must be globally unique
- Create an entity type called that corresponds to whatever `NILE_ENTITY_NAME` is defined in your `.env` file (many are also available as a template from the Nile Admin Dashboard).  The available entity types are [here](../usecases/).
- Create two organizations with users
- Create 2 entity instance in one organization and 1 entity instance in other organization, with a value that matches the schema defined earlier

## Prerequisites

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

## Run

To execute the workflow, run the following command (refer to code [src/index.ts](src/index.ts)).

```
yarn start
```

## Validate

1. Login to the [Nile Admin Dashboard](https://nad.thenile.dev/) via SSO to see the control plane and entity instances (If your developer account is not SSO, enter the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file).

![Nile Admin Dashboard](images/nad.png)

2. Validate tenant isolation by running the command below. For example, if you used the `Database as a Service` use case, at first user polina@demo.io cannot see the organization `Indus Systems` nor any instances in it, but after adding polina@demo.io to `Indus Systems`, polina@demo.io can see all the instances in `Indus Systems` that frank@demo.io can see.

```
yarn test
```

## Next Steps

Run the [webapp](../webapp), a self-service frontend that integrates with Nile on the backend

![metrics](../webapp/images/metrics.png)
