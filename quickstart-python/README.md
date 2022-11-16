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

1. Your environment should have python3 installed.

2. Run the following command from the `quickstart-python` directory:

   ```
   python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
   ```

   Your output should resemble:

   ```bash
   Collecting anyio==3.6.2
     Using cached anyio-3.6.2-py3-none-any.whl (80 kB)
   Collecting attrs==22.1.0
     Using cached attrs-22.1.0-py2.py3-none-any.whl (58 kB)
   ...
   Successfully installed anyio-3.6.2 attrs-22.1.0 certifi-2022.9.24 emoji-2.1.0 h11-0.12.0 httpcore-0.15.0 httpx-0.23.0 idna-3.4 nile-api-0.2.3 python-dateutil-2.8.2 python-dotenv-0.21.0 rfc3986-1.5.0 six-1.16.0 sniffio-1.3.0
   ```

## Setup

You must do all the steps in the [Setup section](../README.md#setup) of the top-level README.md.

:stop_sign: **STOP** :stop_sign: Do not proceed until you have done the above setup :heavy_exclamation_mark:

## Run

There are three ways to execute the quickstart:

1. Step-by-step from the Nile Admin Dashboard: follow the quickstart instructions on the Nile docs webpage for the UI quickstart, useful for people who like to use UIs
2. Step-by-step from the command line: execute snippets of Python code using the Python SDK (see [step-by-step](#step-by-step-from-the-command-line) instructions), useful to learn from individual code blocks
3. Programmatically from the command line: all steps executed with a single command (see [one-command](#one-command) instructions), quickest of the three options

### Step-by-step from the command line

1. Create an entity (refer to code [src/entity.py](src/entity.py)).

```
venv/bin/python src/entity.py
```

2. Create a user (refer to code [src/user.py](src/user.py)).

```
venv/bin/python src/user.py
```

3. Create an organization (refer to code [src/org.py](src/org.py)).

```
venv/bin/python src/org.py
```

4. Create an entity instance (refer to code [src/entity_instance.py](src/entity_instance.py)).

```
venv/bin/python src/entity_instance.py
```

### One-command

To execute the entire workflow, run the following command:

```
venv/bin/python src/all.py
```

## Validate

Login to the [Nile Admin Dashboard](https://nad.thenile.dev/) via SSO to see the control plane and entity instances (If your developer account is not SSO, enter the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file).

Your dashboard should resemble below:

![image](../quickstart/images/nad.png)

Nile automatically generates the OpenAPI spec for the new entity, see the `OPENAPI` tab in the dashboard.

## Next Steps

Run the [webapp](../webapp), a self-service frontend that integrates with Nile on the backend

![metrics](../webapp/images/metrics.png)
