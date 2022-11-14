# Authorization

![image](../images/Nile-text-logo.png)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

The default scenario in these examples is a company that provides a database as SaaS.
But you can modify the `NILE_ENTITY_NAME` parameter in your `.env` file to change it to be any other type of service offering (see [Advanced](../README.md#advanced)).

For this service, you can use Nile's built-in entities to enforce access policies.
This example uses the Nile JS SDK to demonstrate authorization features in Nile in the following workflow:

- List the instances of `DB` entity type allowed to be read in a given organization by one of the predefined users from the [usecases](../usecases/)
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
- List the `DB` instances allowed to be read by the user in a given organization


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

To execute the workflow, run the following command:

```
yarn start
```
