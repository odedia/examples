# Nile Examples

These examples demonstrate how to use Nile for various use cases.
Each one can be run independently, but we recommend running them sequentially in the following order to build up your service as you go:

1. [Multi-tenancy](multi-tenancy): setup your Nile control plane with multiple tenants and users in each organization
2. [Data Plane with Pulumi](data-plane/pulumi/): synchronize your data plane and control plane in real time with Nile events
3. Authorization: _coming soon_
4. Metrics: _coming soon_
5. Webapp: _coming soon_

## Setup

For all examples, you need a local file with your Nile configuration.
For that purpose, create a `.env` file with environment variables.
At the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.
Each subfolder has a symlink to this top-level `.env` file.
