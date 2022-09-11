import * as k8s from '@kubernetes/client-node';
import {
  FlinkDeployment
} from '../../generated/openapi';

interface K8sListResponseWithItems {
  items: object[];
}

export default class FlinkDeploymentService {
  namespace!: string;
  private k8sApiCustom: k8s.CustomObjectsApi;

  private k8sGroup = 'flink.apache.org';
  private k8sVersion = 'v1beta1';
  private k8sDeploymentPlural = 'flinkdeployments';

  constructor(
    namespace: string,
  ) {
    this.namespace = namespace;

    const kc = new k8s.KubeConfig();
    // TODO: has to be `loadFromCluster` in production
    kc.loadFromDefault();
    this.k8sApiCustom = kc.makeApiClient(k8s.CustomObjectsApi)
  }

  async getAll(): Promise<FlinkDeployment[]> {
    const response = await this.k8sApiCustom.listNamespacedCustomObject(this.k8sGroup, this.k8sVersion, this.namespace, this.k8sDeploymentPlural);
    if (response.response.statusCode !== 200) {
      throw new Error(response.response.statusMessage);
    } else {
      const deployments = (response.body as K8sListResponseWithItems).items.map(this.toApiFlinkDeployment);
      return deployments;
    }
  }

  async create(deployment: FlinkDeployment): Promise<void> {
    const response = await this.k8sApiCustom.createNamespacedCustomObject(this.k8sGroup, this.k8sVersion, this.namespace, this.k8sDeploymentPlural, this.toK8sFlinkDeployment(deployment));
    if (response.response.statusCode > 299) {
      throw new Error(response.response.statusMessage);
    } else {
      return;
    }
  }

  async delete(deployment: FlinkDeployment): Promise<void> {
    const name = deployment!.metadata!.name!;
    const response = await this.k8sApiCustom.deleteNamespacedCustomObject(this.k8sGroup, this.k8sVersion, this.namespace, this.k8sDeploymentPlural, name);
    if (response.response.statusCode !== 200) {
      throw new Error(response.response.statusMessage);
    } else {
      return;
    }
  }

  private toApiFlinkDeployment(k8sDeployment: object): FlinkDeployment {
    return {
      metadata: {
        // @ts-ignore
        name: k8sDeployment['metadata']['name']
      },
      spec: {
        flinkConfiguration: {
          // @ts-ignore
          "taskmanager.numberOfTaskSlots": k8sDeployment['spec']['flinkConfiguration']['taskmanager.numberOfTaskSlots'],
        },
        job: {
          // @ts-ignore
          state: k8sDeployment['spec']['jobState'],
          // @ts-ignore
          dockerImage: k8sDeployment['spec']['image'],
          environment: 'local',
          parallelism: 1,
          // @ts-ignore
          upgradeMode: k8sDeployment['spec']['upgradeMode'],
        },
        jobManager: {
          resource: {
            // @ts-ignore
            cpu: k8sDeployment['spec']['jobManager']['resource']['cpu'],
            // @ts-ignore
            memory: k8sDeployment['spec']['jobManager']['resource']['memory'],
          }
        },
        taskManager: {
          resource: {
            // @ts-ignore
            cpu: k8sDeployment['spec']['taskManager']['resource']['cpu'],
            // @ts-ignore
            memory: k8sDeployment['spec']['taskManager']['resource']['memory'],
          },
          // @ts-ignore
          replicas: k8sDeployment['spec']['taskManager']['replicas'],
        }
      },
      status: {
        jobStatus: {
          // @ts-ignore
          jobID: k8sDeployment['metadata']['uid'],
          // @ts-ignore
          state: k8sDeployment['status']['jobStatus']['state'],
        }
      }
    }
  }

  private toK8sFlinkDeployment(apiDeployment: FlinkDeployment): object {
    return {
      apiVersion: `${this.k8sGroup}/${this.k8sVersion}`,
      kind: "FlinkDeployment",
      metadata: {
        name: apiDeployment.metadata?.name
      },
      spec: {
        flinkVersion: "v1_14",
        flinkConfiguration: {
          "taskmanager.numberOfTaskSlots": apiDeployment!.spec?.flinkConfiguration?.taskmanagerNumberOfTaskSlots
        },
        serviceAccount: "flink",
        jobManager: {
          resource: {
            cpu: apiDeployment!.spec!.jobManager!.resource!.cpu,
            memory: apiDeployment!.spec!.jobManager!.resource!.memory,
          }
        },
        taskManager: {
          resource: {
            cpu: apiDeployment!.spec!.taskManager!.resource!.cpu,
            memory: apiDeployment!.spec!.taskManager!.resource!.memory,
          },
          replicas: apiDeployment!.spec!.taskManager!.replicas,
        },
        job: {
          jarURI: apiDeployment.spec?.job?.jarURI, 
          parallelism: apiDeployment!.spec!.job!.parallelism,
          upgradeMode: apiDeployment.spec?.job?.upgradeMode?.toLowerCase
        }
      }
    }
  }
}
