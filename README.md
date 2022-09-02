# Nile Examples

![image](images/Nile-text-logo.png)

## Overview

These examples demonstrate how to use Nile to build a control plane for an Infrastructure SaaS product.
Each one is automated using the [Nile SDK](https://github.com/TheNileDev/nile-js).

## Instructions

You can run the examples independently, but they can also be run sequentionally to build on top of one another.
We recommend running these in the following order to build up your SaaS as you go:

0. [Quickstart](quickstart): setup a minimal Nile control plane with a single tenant.
1. [Multi-tenancy](multi-tenancy): setup the Nile control plane with multiple tenants and users.
2. [Data Plane with Pulumi](data-plane/pulumi/): synchronize your data plane and control plane in real time with Nile events. Even if you're using another deployment tool like Kubernetes or Terraform, similar principles apply.
3. Authorization: _coming soon_
4. Metrics: _coming soon_
5. Webapp: _coming soon_
