# Authorization

![image](../images/Nile-text-logo.png)

## Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Run](#run)
* [Next steps](#next-steps)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Database as a Service](../usecases/DB/) (same as in the Nile Quickstart)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [YOLO](../usecases/README.md#yolo)

For this service, you can use Nile's built-in entities to enforce access policies.
This example uses the Nile Python SDK to demonstrate authorization features in Nile in the following workflow:

- List policies
- Create a new policy that allows the user `read` permissions to instances of the type `DB` which have a property `environment=dev`. There is an implicit deny for all other instances.

  ```json
  {
      actions: ["read"],
      resource: {
        type: "DB",
        properties: {environment: "dev"},
      },
      subject: { email : "shaun@demo.io" },
  }
  ```

- List the `DB` instances allowed to be read by the user in a given organization: should be just those where environment is dev, none in prod
- Delete the policy


## Prerequisites

Verify you are running Python version 3.7 or newer (check with `python --version`)

Run the following command:

```
python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
```

## Setup

You must do all the steps in the [Setup section](../README.md#setup) of the top-level README.md.

:stop_sign: **STOP** :stop_sign: Do not proceed until you have done the above setup :heavy_exclamation_mark:

Then, run the following command to preconfigure the Nile control plane with an entity, organizations, users, and entity instances for the mock usecase, so that you're not starting from scratch.

```
yarn --cwd ../multi-tenancy/ install && yarn --cwd ../multi-tenancy/ start
```

Login to the [Nile Admin Dashboard](https://nad.thenile.dev/) via SSO to see the control plane and entity instances (If your developer account is not SSO, enter the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file).

![image](../multi-tenancy/images/nad.png)

## Run

To execute the workflow, run the following command:

```
venv/bin/python authz.py
```

To delete access policies, run the following command:

```
venv/bin/python delete_all_policies.py
```

## Next Steps

Run the [webapp](../webapp), a self-service frontend that integrates with Nile on the backend

![metrics](../webapp/images/metrics.png)
