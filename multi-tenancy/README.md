# Multi-tenancy

This example sets up a Nile control plane with multi-tenancy.
It uses the Nile SDK available at https://github.com/TheNileDev/nile-js

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
For that purpose, create a `.env` file with environment variables.
At the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.


## Execute

The quickstart workflow creates your control plane and data plane in Nile:

- Sign up a new developer
- Create a workspace, which must be globally unique
- Create an entity called `SkyNet`
- Create two organizations with one user each:
  - `sac-norad` with user nora1@demo.io
  - `sac-norad2` with user nora2@demo.io
- Create a `SkyNet` entity instance in each organization

To execute the above workflow, run the following command:

```
yarn start
```

## Validate

Run the following command to find the new entity instance:

```
yarn test-setup
```

Then log into the [Nile Admin Dashboard](https://nad.thenile.dev/) to see the control plane and entity instances.
Log in using the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file.
