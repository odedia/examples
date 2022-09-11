import { FlinkDeployment } from '../../generated/openapi';

/**
 * Currently using the "name" field to reconcile. This should be improved.
 */
export class ReconciliationPlan {
  readonly toCreate!: FlinkDeployment[];
  readonly toDelete!: FlinkDeployment[];

  private nameMapper = (d: FlinkDeployment) => d.metadata!.name!;

  get creationNames(): string[] {
    return this.toCreate.map(this.nameMapper);
  }

  get deletionNames(): string[] {
    return this.toDelete.map(this.nameMapper);
  }

  constructor(
    requiredDeployments: FlinkDeployment[],
    actualDeployments: FlinkDeployment[]
  ) {
    this.toDelete = actualDeployments.filter(
      (deployment: FlinkDeployment) => requiredDeployments.map(this.nameMapper).indexOf(this.nameMapper(deployment)) === -1
    );
    this.toCreate = requiredDeployments.filter(
      (deployment: FlinkDeployment) => actualDeployments.map(this.nameMapper).indexOf(this.nameMapper(deployment)) === -1
    );
  }
}
