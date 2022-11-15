# Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

## Out of the Box

This repo provides a few sample "service offerings" that you can use to run these examples.

- [Database as a Service](DB/) (same as in the Nile Quickstart)
- [SkyNet as a Service](SkyNet/)
- [Banking as a Service](Banking/)
- [Workload as a Service](Workload/)
- [QRcode as a Service](QRcode/)

## YOLO

If you decide to adapt the examples for your own usecase, define your own service offering and required assets to run the examples.
Use [Database as a Service](./DB/) as a template, copy the files from that folder into a new folder and then modify the files to fit your needs.

## Folder contents

The contents of the use case folder matches the following directory structure (names must be exact):

```bash
├── app
│   ├── index.ts -> ./../../../webapp/form-fields/DB/index.ts
│   ├── logo.svg -> ./../../../webapp/form-fields/DB/logo.svg
│   └── metrics.ts -> ./../../../webapp/metrics/DB/index.ts
├── entity_definition.json
└── init
    ├── Page.js
    ├── admins.json
    ├── entities.json
    ├── entity_utils.js
    └── users.json
```

The purpose of each file is as follows:

- `app`: used by the [webapp](../webapp). This folder has symlinks into the webapp, mentioned here just so you remember to modify this
  - `index.ts`: form fields used for creating new and displaying existing instances (need to also update webapp/form-fields/index.ts)
  - `logo.svg`: used to customize the webapp
  - `metrics.ts`: used to produce and filter the metrics displayed in the webapp
- `entity_definition.json`: (required) represents the entity schema. (In order to use this entity type with the [data-plane/pulumi](../data-plane/pulumi) example, the schema must include a `status` field)
- `init/`: this folder is only used by the examples to initialize the Nile control plane with prepopulated values (not required for real production)
  - `init/admins.json`: (required) starting list of admins, i.e.,  org creators, and their respective organizations
  - `init/Pages.js`: used by the [authz-be](../authz-be) example to create a schema for the local MongoDB table that uses the entity table
  - `init/entity_utils.js`: (required) used by the [quickstart](../quickstart) to check if an entity already exists with some criteria, or create a new instance if not
  - `init/entities.json`: (required) starting list of entities, must adhere to the schema defined in `entity_definition.json`. There must be at least three entities
  - `init/users.json`: (required) starting list of users and their respective organizations.
