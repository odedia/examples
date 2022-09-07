# Nile Data Plane Example #

![image](../../images/Nile-text-logo.png)

## Overview

This example demonstrates how to synchronize (i.e., `reconcile`) the data
plane and control plane in real time with Nile events.

Nile doesn't prescribe any particular deployment solution, but here we'll be
using [Pulumi](https://app.pulumi.com/) to deploy objects into AWS. 

> If you're using another tool like Kubernetes or Terraform, replace
> the [`PulumiAwsDeployment`](./src/commands/reconcile/lib/pulumi/PulumiAwsDeployment.ts) 
> class in this example with your own deployment implementation.

## Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Configure the Control Plane](#configure-the-control-plane)
* [Configure the Data Plane](#configure-the-data-plane)
* [Run the reconciler](#run-the-reconciler)
* [Explanation](#Explanation)
* [Add or remove instances](#add-or-remove-instances)

## Prerequisites ##

This example assumes you have:

* [An AWS account](https://aws.amazon.com/free/)
* [A Pulumi account](https://app.pulumi.com/signup) that's
  [connected to your AWS account](https://www.pulumi.com/docs/get-started/aws/begin/)
* [The Pulumi CLI installed](https://www.pulumi.com/docs/reference/cli/)
* A Nile developer account using an email address and password

## Setup

For all examples, you need a local file with your Nile configuration.
For that purpose, at the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
$ examples> cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.

## Configure the Control Plane ##

There are a few ways to configure the control plane:

- [Nile Admin Dashboard](#nile-admin-dashboard): use the UI to manually configure the control plane
- [Programmatically](#programmatically): use the provided script which leverages the Nile SDK

### Nile Admin Dashboard

> If you're not familiar with the terminology used below, read the
> [Nile Quickstart](https://www.thenile.dev/docs/current/quick-start-ui).

For the values below, make sure they match what you set in the `.env` file.

1. Login to the [Nile Admin Dashboard](https://nad.thenile.dev/).
2. If there isn't one already, create a workspace named "clustify".
3. Create an entity type named "SkyNet". For this example, the entity definition should have a schema that matches the schema defined in [EntitySchema.js](../../quickstart/src/models/EntitySchema.js).
:

```json
{
  "name": "SkyNet",
  "schema": {
    "type": "object",
    "properties": {
      "greeting": {
        "type": "string"
      }
    },
    "required": [
      "greeting"
    ]
  }
}
```

4. Create an organization in the workspace named "sac-norad".
5. Create a "SkyNet" instance in the organization, with a value that matches 
   the schema defined earlier:

```json
{
  "greeting": "Come with me if you want to live."
}
```

### Programmatically

1. Install and build the project

```bash
yarn install && yarn build
```

2. Configure the control plane. This command will read from the `.env` file you defined earlier. The script is idempotent and instances will be created only once.

```bash
yarn prereconcile
```

## Configure the Data Plane ##

These instructions summarize how to get started with Pulumi on AWS.
See the [Pulumi documentation](https://www.pulumi.com/docs/get-started/aws/begin/) for a more complete setup.

1. Set up a new Pulumi project called `pulumi-clustify`:

```bash
mkdir pulumi-clustify && cd pulumi-clustify
pulumi new aws-typescript
```

When prompted, accept the defaults:

```
project name: (pulumi-clustify)
project description: (A minimal AWS TypeScript Pulumi program) 
Created project 'pulumi-clustify'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name: (dev) 
Created stack 'dev'

aws:region: The AWS region to deploy into: (us-east-1)
Saved config
```

2. Run `pulumi up` to validate that Pulumi is configured correctly. This will
create a new Pulumi stack named `dev`. We won't be using this stack, but its
presence verifies that you're ready to proceed.

```bash
pulumi up
```

## Run the reconciler ##

Ensure that the values in your `.env` file match the values used in the setup of the control plane.

Next, there are several ways to run the reconciler, each described in the following sections:

- [Using yarn](#using-yarn)
- [Executable binary](#executable-binary)
- [Docker](#docker) 

### Using `yarn`

1. Back up in the `data-plane/pulumi` directory, create the executable command binary with the following command

```bash
yarn install && yarn build
```

2. Run the reconciler. This command will read from the `.env` file you defined earlier.

```bash
yarn reconcile
```

### Executable binary

1. Back up in the `data-plane/pulumi` directory, create the executable command binary with the following command

```bash
yarn install && yarn build
```

2. Source the `.env` parameters into your shell.  This step isn't entirely necessary since in the next step you can pass in the Nile configuration parameter values at the command line, but assuming you already went through the effort of configuring the `.env` file, may as well use it.

```bash
source .env
```

3. Run the following reconciler executable:

```bash
./bin/dev reconcile --basePath $NILE_URL \
  --workspace $NILE_WORKSPACE \
  --entity $NILE_ENTITY_NAME \
  --organizationName $NILE_ORGANIZATION_NAME \
  --email $NILE_DEVELOPER_EMAIL \
  --password $NILE_DEVELOPER_PASSWORD
```

### Docker

1. Back up in the `data-plane/pulumi` directory, if you haven't setup your control plane yet, set it up now:

```bash
yarn prereconcile
```

2. Run the reconciler Docker image. Ensure that you have valid values for the three input parameters required to connect to S3 (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) and Pulumi (`PULUMI_ACCESS_TOKEN`):

```bash
docker run --init --rm \
  --env-file .env \
  -e AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id) \
  -e AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key) \
  -e PULUMI_ACCESS_TOKEN=$PULUMI_ACCESS_TOKEN \
  theniledev/reconciler:v0.3
```

## Explanation

The reconciler will immediately find the newly instantiated SkyNet instance in the Nile
control plane and create a Pulumi stack that represents it, defined by the
[`pulumiS3.ts`](./src/commands/reconcile/lib/pulumi/pulumiS3.ts). Pulumi also
created a new S3 bucket containing a static website and a bucket policy that
allows public access.

The reconciler will also log out the instance properties, including the 
`websiteUrl` of the object created by the [`pulumis3` program](./src/commands/reconcile/lib/pulumi/pulumiS3.ts):

```bash
Outputs:

    bucketPolicy: {
        // ...redacted...
    }
    object      : {
        // ...redacted...
    }
    websiteUrl  : "s3-website-bucket-5c7d7bc.s3-website.us-east-2.amazonaws.com"

Resources:
    + 4 created

Duration: 5s
```

Pull up that `websiteUrl` in-browser and verify you see the provided "greeting"
as well as all of the instance details.

## Add or Remove Instances ##

While the reconciler is running, in the [Nile Admin Dashboard](https://nad.thenile.dev/), add one or
more new SkyNet instances to the organization. This will trigger events that the
reconciler receives and the data plane will synchronize accordingly. Deleting an instance in the
control plane will result in destruction of the corresponding Pulumi stack.

With the current implementation of the [reconciler example](src/commands/reconcile/index.ts), if the reconciler stops running for a period of time and then restarts, the events that occurred during the down time are handled as follows:

- _New_ entity instances that were created will be reconciled in the data plane
- _Old_ entity instances that were deleted will be reconciled in the data plane
- _Existing_ entity instances that were updated will not be automatically reconciled in the data plane because the current example just compares instance IDs. It is left to the developer to apply their own logic to detect the change and to determine what action to take to update the data plane, if any.
