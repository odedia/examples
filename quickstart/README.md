# Quickstart

![image](../images/Nile-text-logo.png)

## Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Run](#run)
* [Next steps](#next-steps)

## Overview

The mock scenario in these examples is a company that provides a [Database as a Service](../usecases/DB/)
This quickstart programmatically setups up your [Nile](https://thenile.dev/) control plane similar to what is done in the Nile quickstart documentation.
By the end of this quick start, you will have:

- a workspace (your control plane)
- an entity definition with a schema (the definition of your data plane that represents a MySQL database)
- an organization (a tenant) with one user (end customer) in that organization
- an entity instance (logical instance of the MySQL database) in that organization

## Prerequisites

1. Your environment should have the following installed:

   - `node`

     - Validate your environment has the minimum required Node version v18.0.0 or higher. If you are running earlier versions, you may encounter errors such as `ReferenceError: fetch is not defined`. (If you use `nvm`, run `nvm use`).

   - `ts-node`
   - `yarn` (or `npm`)

2. Run the following command from the `quickstart` directory:

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

There are three ways to execute the quickstart:

1. Step-by-step from the Nile Admin Dashboard: follow the quickstart instructions on the Nile docs webpage for the UI quickstart, useful for people who like to use UIs
2. Step-by-step from the command line: execute snippets of Typescript code using the JS SDK (see [step-by-step](#step-by-step-from-the-command-line) instructions), useful to learn from individual code blocks
3. Programmatically from the command line: all steps executed with a single command (see [one-command](#one-command) instructions), quickest of the three options

### Step-by-step from the command line

1. Verify the workspace and credentials set in your `.env` file by testing a login.

```
yarn test-login
```

2. Create an entity (refer to code [src/entity.ts](src/entity.ts)).

```
yarn setup-entity
```

3. Create a user (refer to code [src/user.ts](src/user.ts)).

```
yarn setup-user
```

4. Create an organization (refer to code [src/org.ts](src/org.ts)).

```
yarn setup-org
```

5. Create an entity instance (refer to code [src/entity-instance.ts](src/entity-instance.ts)).

```
yarn setup-entity-instance
```

### One-command

To execute the entire workflow, run the following command:

```
yarn start
```

## Validate

Login to the [Nile Admin Dashboard](https://nad.thenile.dev/) via SSO to see the control plane and entity instances (If your developer account is not SSO, enter the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file).

Your dashboard should resemble below:

![Nile Admin Dashboard](images/nad.png)

Nile automatically generates the OpenAPI spec for the new entity, see the `OPENAPI` tab in the dashboard.

## Next Steps

Run the [webapp](../webapp), a self-service frontend that integrates with Nile on the backend

![metrics](../webapp/images/metrics.png)
