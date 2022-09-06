# Authorization

## Overview

This example shows how to configuration authorization.

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

For all examples, you need a local file with your Nile configuration.
For that purpose, at the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
$ examples> cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.

## Execute

The workflow does the following:

- Lists the `SkyNet` instances allowed to be read by the user nora1@demo.io in a given organization
- Creates a new rule that denies the user access to instances of the type `SkyNet` (organization is provided in the request)

  ```json
  {
    "actions": [ "deny" ],
    "resource": { "type": "SkyNet" },
    "subject": { "email": "nora1@demo.io" }
  }
  ```

- Lists the `SkyNet` instances allowed to be read by the user in a given organization: should be none
- Deletes the rule
- Lists the `SkyNet` instances allowed to be read by the user in a given organization

To execute the above workflow, run the following command:

```
yarn start
```
