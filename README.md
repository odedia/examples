# Nile Examples

![image](images/Nile-text-logo.png)

## Overview

These examples demonstrate how to use Nile as a control plane for an Infrastructure SaaS product.

## Instructions

Start here to configure a base Nile control plane:

| Example | Languages Shown | Description |
|---------|-----------------|-------------|
| [Quickstart](quickstart) | JS SDK | Setup a minimal Nile control plane with a single tenant |

You can use Nile for different use cases, so after running the Quickstart, you can run the examples independently.
They can also be run sequentionally to build on top of one another, in which case, we recommend running them in the following order to build up your SaaS as you go.

| Example | Languages Shown | Description |
|---------|-----------------|-------------|
| [Multi-tenancy](multi-tenancy/) | JS SDK | Setup the Nile control plane with multiple tenants and users |
| [Data Plane with Pulumi](data-plane/pulumi/) | JS SDK | Synchronize your data plane and control plane in real time with Nile events. Even if you're using another deployment tool like Kubernetes or Terraform, similar principles apply |
| [Authorization](authz/) | JS SDK | Use ABAC to grant and revoke permissions to resources |
| [Python + Flask Todo List Webapp](python-flask-todo-list/) | Python REST | Take a basic Todo List webapp written in Python and Flask and turn it to a PLG SaaS product with Nile APIs |
| Metrics | | _coming soon_ |
