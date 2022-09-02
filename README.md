# Nile Examples

![image](images/Nile-text-logo.png)

## Overview

These examples demonstrate how to use Nile to build a control plane for an Infrastructure SaaS product.

## Instructions

Each example is automated using the [Nile SDK](https://github.com/TheNileDev/nile-js).

You can run them independently, so you can run just the ones that you are interested in, but they can build on top of one another as you go through them.

We recommend running them in the following order to build up your SaaS as you go:

0. [Quickstart](quickstart): setup a minimal Nile control plane with a single tenant.
1. [Multi-tenancy](multi-tenancy): setup the Nile control plane with multiple tenants and users in each organization.
2. [Data Plane with Pulumi](data-plane/pulumi/): synchronize your data plane and control plane in real time with Nile events. Even if you're using another tool like Kubernetes or Terraform, similar principles apply.
3. Authorization: _coming soon_
4. Metrics: _coming soon_
5. Webapp: _coming soon_
