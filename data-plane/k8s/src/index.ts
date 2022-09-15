import Nile, { Instance, CreateEntityRequest } from '@theniledev/js';
import { ReconciliationPlan } from './model/ReconciliationPlan';
import FlinkDeploymentService from './service/FlinkDeploymentService';
import { FlinkDeployment } from '../generated/openapi';

const emoji = require('node-emoji');
const debug = require('debug')('data-plane-on-k8s-demo')
require('dotenv').config({ override: true })
const fs = require('fs');

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ORGANIZATION_NAME"
]
envParams.forEach( (key: string) => {
  if (!process.env[key]) {
    console.error(emoji.get('x'), `Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const NILE_ORGANIZATION_NAME = process.env.NILE_ORGANIZATION_NAME!;
const CHECK_STATUS = process.env.CHECK_STATUS; // optional, and therefore not included earlier for verification

var deploymentService!: FlinkDeploymentService;

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = JSON.parse(fs.readFileSync('./spec/FlinkDeployment.json'))

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});


async function run() {
  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(emoji.get('x'), `Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(emoji.get('white_check_mark'), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!`);

  const instances = await loadInstances(
    String(NILE_ORGANIZATION_NAME),
    entityDefinition.name
  );
  const requiredDeployments = toDeployments(instances);

  console.log(emoji.get('white_check_mark'), `Got Flink deployments from Nile: ` + JSON.stringify(requiredDeployments, null, 2));

  deploymentService = new FlinkDeploymentService('default'); // using default namespace on K8s for these deployments
  const actualDeployments = await deploymentService.getAll();

  console.log(emoji.get('white_check_mark'), `Got Flink deployments from K8s: ` + JSON.stringify(actualDeployments, null, 2));

  // stitch Nile and Flink together
  const plan = new ReconciliationPlan(requiredDeployments, actualDeployments);

  if (CHECK_STATUS) {
    console.log(emoji.get('white_check_mark'), 'Performing only a status check');
    console.log(
      `Pending destruction: ${plan.deletionNames} (${plan.deletionNames.length})`
    );
    console.log(
      `Pending creation: ${plan.creationNames} (${plan.creationNames.length})`
    );
    process.exit(0); // thats it, we just checked status
  }

  // load or remove deployments based on Nile
  await synchronizeDataPlane(plan);

  // listen to updates from Nile and handle accordingly
  await listenForNileEvents(
    entityDefinition.name,
    findLastSeq(Object.values(instances))
  );
}

run();

/**
 * Requests all the instances from a single organization, representing Flink deployments
 * @param organization
 * @param entity
 * @returns Array<Instance>
 */
async function loadInstances(
  organization: string,
  entity: string
): Promise<Instance[]> {

  var all_orgs = await nile.organizations.listOrganizations({
    workspace: NILE_WORKSPACE
  })

  var curr_org = all_orgs.find(org => org.name == organization)
  if (!curr_org) {
    console.error(emoji.get('x'), "Failed to find " + organization + " in workspace " + NILE_WORKSPACE + ". Try running `yarn setup` again.");
    process.exit(1);
  }

  const instances = (
    await nile.entities.listInstances({
      org: curr_org.id,
      type: entity,
    })
  )
    .filter((value: Instance) => value !== null && value !== undefined)
  debug('Loaded Instances', instances);
  return instances;
}

function toDeployments(instances: Instance[]): FlinkDeployment[] {
  return instances.map((value: Instance) => value.properties as FlinkDeployment);
}

/**
 *
 * @param instances Array<Instance>
 * @returns the max value of `seq`, which is the most recent Instance
 */
function findLastSeq(instances: Instance[]): number {
  return instances
    .map((value: Instance) => value?.seq || 0)
    .reduce((prev: number, curr: number) => {
      return Math.max(prev, curr || 0);
    }, 0);
}

/**
 * Parses the reconciliation plan between Nile and Flink, to create or destroy deployments based on Nile as the source of truth
 * @param plan ReconciliationPlan
 */
async function synchronizeDataPlane(plan: ReconciliationPlan) {
  console.log(emoji.get('thumbsup')+' Performing initial synchronization of control plane and data plane');
  debug(JSON.stringify(plan, null, 2));

  // destroy any stacks that should not exist
  for (const toDelete of plan.toDelete) {
    await deploymentService.delete(toDelete);
  }

  // create any stacks that should exist
  for (const toCreate of plan.toCreate) {
    await deploymentService.create(toCreate);
  }
}

/**
 * Listens for Nile emitting events and destroys or creates Flink deployments accordingly
 * @param entityType Entity to listen for events
 * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
 */
async function listenForNileEvents(entityType: string, fromSeq: number) {
  console.log(
    emoji.get('ear')+` Listening for events for ${entityType} entities from sequence #${fromSeq}`
  );
  await new Promise(() => {
    // TODO: buffer events keyed by entity id and only execute the latest state
    nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
      debug("event: " + JSON.stringify(e));
      if (e.after!.deleted) {
        console.log(emoji.get('wastebasket') + ` Deleting ${entityType}` )
        console.log(JSON.stringify(e.after, null, 2))
        await deploymentService.delete(e.after!.properties as FlinkDeployment).catch(err => {
          console.log(emoji.get("x") + ` Failed to delete ${entityType}`)
          debug(err)
          debug(err.body)
        })
      } else {
        console.log(emoji.get('new') + ` Creating ${entityType}` )
        console.log(JSON.stringify(e.after, null, 2))
        await deploymentService.create(e.after!.properties as FlinkDeployment).catch(err => {
          console.log(emoji.get("x") + ` Failed to create ${entityType}`)
          debug(err)
          debug(err.body)
        })
      }
    });
  });
}
