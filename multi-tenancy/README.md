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
✨  Done in 2.58s.
```

## Execute

The quickstart workflow creates your control plane and data plane in Nile:

- Sign up a new developer
- Create a workspace
- Create an entity
- Create an organization and tenant
- Create an instance of an entity in the organization

To execute the above workflow, run the following command:

```
yarn setup
```

To run it repeatedly with new entries, pass in a unique parameter that will be the suffix:

```
yarn setup 2
```

## Validate

To validate that the quickstart worked when you ran `yarn setup`, run the following command to find the new instance of the entity:

```
yarn test-setup
```

Then log into the [Nile Admin Dashboard](https://nad.thenile.dev/) (default username/password: dev-mary@dw.demo/password) to see the control plane and data plane instances. 
