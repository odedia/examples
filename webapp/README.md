# Self-serve Webapp

![image](../images/Nile-text-logo.png)

## Overview

This example shows a SaaS service integrated with [Nile](https://thenile.dev/). 
Nile provides an entity system, event system, and tenant-aware metrics.

The mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Database as a Service](../usecases/DB/) (same as in the Nile Quickstart)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [Workload as a Service](../usecases/Workload/)
- [YOLO](../usecases/README.md#yolo)

Everything you need to run this example is in one of the folders above.
Once a developer initializes their control plane in Nile with their service's entity schema, they can capture events as end users create new instances to reconcile Nile with their data plane, get built-in multi-tenancy and authorization policies, and show metrics to users for consumption and billing using Nile's metrics API and matching UI components.
This webapp demonstrates a sample frontend for their SaaS application that integrates with the control plane using Nile React components for [Next.js](https://nextjs.org/).
It provides self-service workflows for user signup/login, org creation, and instance management.

![image](../images/webapp.png)

## Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Run the web server locally](#run-the-web-server-locally)
* [Playbook](#playbook)

## Prerequisites

1. Your environment should have the following installed:

   - `node`
   - `ts-node`
   - `yarn` (or `npm`)

2. Run the following command from the `webapp` directory:

   ```
   yarn install
   ```

### Setup certificates

Currently, Nile will only serve cookies to `\*.thenile.dev` domains, which is required for login, so you must put this webapp in that domain. Create certificates for your local machine and add them to your keychain.

1. Edit the file `/etc/hosts` and at the bottom, add the line `127.0.0.1 local.thenile.dev`

2. From the `webapp` directory, create a new directory for certificates.

   ```bash
   mkdir .certificates
   ```

3. Run the following command to add an SSL key that lasts 1 year

   ```bash
   (cd .certificates && \
      openssl req -x509 -out localhost.crt -keyout localhost.key \
        -days 365 \
        -newkey rsa:2048 -nodes -sha256 \
        -subj '/CN=*.thenile.dev' -extensions EXT -config <( \
        printf "[dn]\nCN=*.thenile.dev\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:*.thenile.dev\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth"))
   ```

3. Trust the new certificate you just created

   - Run `open .certificates/localhost.crt` to open it in Keychain.
   - Make sure the certificate is under `Login` (not `System`), moving it there if necessary.
   - Double click on the certificate, and from the popup window, expand the `Trust` dropdown and select `Always Trust`.

   ![image](images/certs.png)

## Setup

You must do all the steps in the [Setup section](../README.md#setup) of the top-level README.md.

:stop_sign: **STOP** :stop_sign: Do not proceed until you have done the above setup :heavy_exclamation_mark:

Then, run the following command to preconfigure the Nile control plane with an entity, organizations, users, and entity instances for the mock usecase, so that you're not starting from scratch.

   ```bash
   yarn setup-nile
   ```

(Optional) If you want to hook up your Nile control plane to a data plane and provision real resources, run the reconciler to synchronize events between the control plane and data plane (e.g. if you use the webapp to create new entity instances). Follow the instructions in the [Pulumi example](../data-plane/pulumi/) and start the reconciler in a separate terminal window.  If you skip this step, the instances in your webapp will not go to `status=Up`.

## Run the webapp

Run the following command from the `webapp` directory.  It starts the web server locally and produces metrics to Nile that are rendered in charts in the webapp.

```bash
yarn dev
```

## Playbook

1. As an end user: open [https://local.thenile.dev](http://local.thenile.dev) with your browser and log in as one of the predefined users for the entity type from the [usecases](../usecases/). For example, for entity type `DB`, you can log in as `polina@demo.io` (password is `password`).

   The user login screen should resemble below:

   ![image](images/login.png)

2. Once logged in, the user sees the entity instances (e.g. databases in this mock scenario) that she has access to.

   ![image](images/instances.png)

3. Click on one of the instances to see metrics. These metrics are currently mock generated from the webapp itself, so it will take some time for them to initialize and start to render.

   ![image](images/metrics.png)

4. Logout. Then instead of logging in as an existing user, sign up as a new user.  Enter any email/password, then create an organization name.

5. Create a new instance.  If you are running the reconciler in a separate terminal window (see [Setup](#setup)), then observe the resources being provisioned and updating Nile with its status.

6. Add a new user to the org, and then log out of the webapp and log in as the newly created user. Observe that the new user sees all the same instances in the org.

7. As a Nile developer: Login to the [Nile Admin Dashboard](https://nad.thenile.dev/) to see the control plane and entity instances.

8. From the dashboard, notice the multi-tenancy features, with tenants belonging to different organizations. Your dashboard should resemble below:

   ![image](images/nad.png)
