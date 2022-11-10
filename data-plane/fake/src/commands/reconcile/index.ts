import { Command } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { flagDefaults } from './flagDefaults';

var emoji = require('node-emoji');

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description = 'reconcile nile deploys with a fake data plane';

  static flags = flagDefaults;

  nile!: NileApi;

  async run(): Promise<unknown> {
    const { flags } = await this.parse(Reconcile);
    const {
      status,
      entity,
      basePath,
      workspace,
      email,
      password,
      authToken,
    } = flags;

    if (!entity) {
      console.error ("Error: must pass in entity");
      process.exit(1);
    }

    // nile setup
    this.nile = await Nile({
      basePath,
      workspace,
    }).connect(authToken ?? { email, password });
    console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile`);

    // load instances from all orgs
    var instances = await this.loadNileInstances(entity);

    // Iterate through all existing instances and set to `Up`
    // regardless if they have been processed before or not
    for (let instanceID of Object.keys(instances)) {

      console.log("\n" + emoji.get('arrow_right'), ` ${instanceID}: detected instance to reconcile`);

      // Get orgID
      let orgID = await this.getOrgIDFromInstanceID(instanceID, entity);
      if (!orgID) {
        console.log("orgID is undefined?");
        process.exit(1);
      }

      // Fake data plane, nothing to really do

      // Update status=Up and fake endpoint value
      var endpoint;
      const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entity}/init/entity_utils.js`);
      if (setDataPlaneReturnProp != null) {
        const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entity}/init/entity_utils.js`);
        endpoint = getDataPlaneReturnValue();
      } else {
        endpoint = "Unknown";
      }
      await this.updateInstance(orgID, entity, instanceID, "Up", endpoint);

    };

    var lastSeq = this.findLastSeq(Object.values(instances));

    if (status) {
      return;
    }
  
    // listen to updates from nile and handle stacks accordingly
    await this.listenForNileEvents(
      String(flags.entity),
      lastSeq
    );

  }

  /**
    * pretend to synchronize to a fake data plane for the initial set of instances
    * @param entityType
    * @returns number that represents the last seen sequence number
    **/
  async initSyncFakeDP(entityType: string): Promise< number > {

    // load instances from all orgs
    var instances = await this.loadNileInstances(entityType);

    // Iterate through all existing instances and set to `Up`
    // regardless if they have been processed before or not
    for (let instanceID of Object.keys(instances)) {

      console.log("\n" + emoji.get('arrow_right'), ` ${instanceID}: detected instance to reconcile`);

      // Get orgID
      let orgID = await this.getOrgIDFromInstanceID(instanceID, entityType);
      if (!orgID) {
        console.log("orgID is undefined?");
        process.exit(1);
      }

      var endpoint;
      const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
      if (setDataPlaneReturnProp != null) {
        const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
        endpoint = getDataPlaneReturnValue();
      } else {
        endpoint = "Unknown";
      }
      await this.updateInstance(orgID, entityType, instanceID, "Up", endpoint);

    };

    return (this.findLastSeq(Object.values(instances)));
  
  }

  /**
    * Requests all the instances from all organizations in a workspace
    * @param entityType
    * @returns Array<Instance> info about data plane
    */
   async loadNileInstances(
     entityType: string
   ): Promise<{ [key: string]: Instance }> {
     const instances = (
       await this.nile.entities.listInstancesInWorkspace({
         type: entityType,
       })
     )
       .filter((value: Instance) => value !== null && value !== undefined)
       .reduce((acc, instance: Instance) => {
         acc[instance.id] = instance;
         return acc;
       }, {} as { [key: string]: Instance });
     this.debug('Nile Instances', instances);
     return instances;
   }

  /**
   *
   * @param instances Array<Instance> info about the data plane
   * @returns the max value of `seq`, which is the most recent Instance
   */
  private findLastSeq(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }

  /**
   * listens for Nile emitting events and destroys or creates DP accordingly
   * @param entityType Entity to listen for events
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   */
  private async listenForNileEvents(entityType: string, fromSeq: number) {
    this.log(
      `Listening for events for ${entityType} entities from sequence #${fromSeq}`
    );
    await new Promise(() => {
      this.nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        //this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          console.log("\n");
          console.log(emoji.get('bell'), `${e.after.id}: received an event for instance`);
          let orgID = await this.getOrgIDFromInstanceID(e.after.id, entityType);
          if (!orgID) {
            console.log("orgID is undefined?");
            process.exit(1);
          }
          if (e.after.deleted) {
            // Detected delete instance
            if (await this.isChangeActionable(orgID, entityType, e.after.id, "Deleted")) {
              await this.updateInstance(orgID, entityType, e.after.id, "Deleted", "N/A")
            }
          } else {
            // Detected create instance
            if (await this.isChangeActionable(orgID, entityType, e.after.id, "Submitted")) {
              await this.createAndUpdate(orgID, entityType, e.after);
            }
          }
        }
      });
    });
  }

  private async createAndUpdate(orgID: string, entityType: string, instance: Instance) {
    console.log(emoji.get('hourglass'), `${instance.id}: pretending to create new instance`);

    await this.updateInstance(orgID, entityType, instance.id, "Provisioning", "-");

    console.log(emoji.get('white_check_mark'), `${instance.id}: fake created an instance in the data plane (noop)`);

    var endpoint;
    const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
    if (setDataPlaneReturnProp != null) {
      const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
      endpoint = getDataPlaneReturnValue();
    } else {
      endpoint = "Unknown";
    }
    //console.log(`DB endpoint: ${endpoint}`);

    await this.updateInstance(orgID, entityType, instance.id, "Up", endpoint);
  }


  /**
   * looks up the organization ID from the organization name
   * @param orgName name of organization to lookup
   * @returns orgID ID of organization; or null if name not found
   */
  private async getOrgIDFromOrgName(
    orgName: String): Promise< string | null > {
    this.log(
      `Looking up the organization ID from the organization name ${orgName}`
    );

    // Check if organization exists
    var myOrgs = await this.nile.organizations.listOrganizations()
    var maybeOrg = myOrgs.find( org => org.name == orgName)
    if (maybeOrg) {
      return maybeOrg.id
    } else {
      return null
    }
  }


  /**
   * looks up the organization ID from the organization name
   * @param orgName name of organization to lookup
   * @returns orgID ID of organization; or null if name not found
   */
  private async getOrgIDFromInstanceID(
    instanceID: String,
    entityType: string ): Promise< string | null > {

    // Search through all instances in all orgs to find which org an instance belongs to
    var organizations = await this.nile.organizations.listOrganizations();
    for (let i=0; i < organizations.length; i++) {
      let orgID = organizations[i].id;
      let instances = await this.nile.entities.listInstances({
          org: orgID,
          type: entityType,
      });
      if (instances.find( instance => instance.id==instanceID)) {
        console.log(emoji.get('dart'), `${instanceID}: instance is in org ${orgID}`);
        return orgID;
      }
    }

    console.error(emoji.get('x'), `${instanceID}: could not determine org this instance`);
    process.exit(1);

    return "dummy";

  }

  /**
   * returns an Instance from the instanceID
   */
  private async getInstanceFromInstanceID(
    orgID: string,
    instanceID: string,
    entityType: string ): Promise< Instance | null > {

    const body = {
      org: orgID,
      type: entityType,
      id: instanceID
    };
    
    var myInstance = await this.nile.entities
      .getInstance(body);
    if (myInstance) {
      return myInstance;
    } else {
      console.error(emoji.get('x'), `${instanceID}: could not get Instance from this instance ID`);
      process.exit(1);
      return null;
    }

  }

  /**
   * Check metadata change before taking action
   * @param ID name of organization to lookup
   * @param entity type
   * @param instance ID
   * @param statusToActOn value
   * @returns boolean of change detected that data plane should act on
   */
  private async isChangeActionable(
    orgID: string, entityType: string, instanceID: string, statusToActOn: string): Promise< boolean > {

    let change = false;

    // Get current instance properties
    var properties;
    const body1 = {
      org: orgID,
      type: entityType,
      id: instanceID,
    };
    await this.nile.entities
      .getInstance(body1)
      .then((data) => {
        properties = data.properties as { [key: string]: unknown };

        // Compare the status
        if (properties.status == statusToActOn) {
          change = true;
        }

      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    if (change) {
      console.log(emoji.get('white_check_mark'), `${instanceID}: event analyzed, change is actionable`);
    } else {
      console.log(emoji.get('x'), `${instanceID}: event analyzed, change is not actionable`);
    }

    return change;
  }


  /**
   * update a property in the instance
   * @param ID name of organization to lookup
   * @param entity type
   * @param instance ID
   * @param status properties field
   */
  private async updateInstance(
    orgID: string, entityType: string, instanceID: string, status: string, connection: string): Promise< null > {
    //this.log(
     // `Updating Instance ${instanceID}: status=${status}, connection=${connection}`
    //);

    // Get current instance properties
    var properties;
    const body1 = {
      org: orgID,
      type: entityType,
      id: instanceID,
    };
    await this.nile.entities
      .getInstance(body1)
      .then((data) => {
        properties = data.properties as { [key: string]: unknown };

        // For these examples always assume a status field
        properties.status = status;

        if (entityType == "DB") {
          properties.connection = connection;
        } else {
          // Check if there other fields to update in the Control Plane
          const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
          if (setDataPlaneReturnProp != null) {
            const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
            properties[setDataPlaneReturnProp] = getDataPlaneReturnValue();
          }
       }

      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    if (!properties) {
      console.error (emoji.get('x'), `${instanceID}: error getting properties from current instance`);
      process.exit(1);
    }
    // Update the instance with the new properties
    const body = {
      org: orgID,
      type: entityType,
      id: instanceID,
      updateInstanceRequest: {
        properties: properties
      },
    };
    await this.nile.entities
      .updateInstance(body)
      .then((data) => {
        console.log(emoji.get('white_check_mark'), `${instanceID}: updated properties: status=${status}, connection=${connection}`);
      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    return null;
  }

}
