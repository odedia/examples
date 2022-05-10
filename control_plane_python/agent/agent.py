import boto3
import os
import sys
import logging
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))

sys.path.insert(0, '') # hack to import Nile SDK before we publish it
sys.path.insert(0, '../') # hack to import Nile SDK before we publish it
from nile import nile


url = os.environ.get('NILE_URL', 'http://localhost:8080')
#ID is temporary, until we route by workspace name or entire base urls for a workspace
workspace_id = os.environ.get('NILE_WORKSPACE_ID','4')
# The agent logs in as a specific tenant in order to guarantee tenant isolation
# This agent will run in the tenant VPC and will only ever see clusters that belong to this tenant.
# If you need a different access pattern, contact the Nile team
username = os.environ.get('NILE_TENANT_USERNAME','gwen@demo.com')
password = os.environ.get('NILE_TENANT_PASSWORD','verysecret')
# This is specific to this demo
mysql_default_password =  os.environ.get('MYSQL_DEFAULT_PWD','changeme')

nile = nile.NileClient(url, workspace_id)
rds = boto3.client('rds')


def create_handler(event):
    try:
        new_cluster =  rds.create_db_cluster(
            Engine='aurora-mysql',
            DBClusterIdentifier=event['properties']['cluster_name'],
            MasterUserPassword=mysql_default_password,
            MasterUsername="root")
        logging.info("Successfully asked AWS to create cluster: " + event['properties']['cluster_name'])
    except rds.exceptions.DBClusterAlreadyExistsFault:
        logging.warning(f"Cluster {event['properties']['cluster_name']} already exists, so can't create it. Nile state will be updated in the reconciliation loop")
        return
    
    # Update Nile with the new status and 
    event['properties']['status'] = new_cluster['DBCluster']['Status']
    event['properties']['Endpoint'] = new_cluster['DBCluster']['Endpoint']
    event['properties']['ARN'] = new_cluster['DBCluster']['DBClusterArn']
    nile.update_instance(event['type'], event['id'], event, access_token)
    logging.info("successful updated Nile with new cluster details:" + event)

def delete_handler(event):
    try:
        deleted = rds.delete_db_cluster(
            DBClusterIdentifier=event['properties']['cluster_name'],
            SkipFinalSnapshot=True)
        logging.info("Successfully asked AWS to delete cluster: " + event['properties']['cluster_name'])
    except rds.exceptions.DBClusterNotFoundFault:
        logging.info(f"Cluster {event['properties']['cluster_name']} doesn't exist, so can't delete it. Doing nothing and will let the reconciliation loop handle the rest")
        return
    event['properties']['status'] = deleted['DBCluster']['Status']
    nile.update_instance(event['type'], event['id'], event['properties'], access_token)
    logging.info("successful updated Nile with new cluster details:" + str(event))

#TODO batch requests to AWS
def reconcile(cluster):
    try:
        updated = rds.describe_db_clusters(DBClusterIdentifier=cluster['properties']['cluster_name'])['DBClusters'][0]
        cluster['properties']['status'] = updated['Status']
        nile.update_instance(cluster['type'], cluster['id'], cluster['properties'], access_token)
        logging.info("successful reconciled Nile with new cluster details:" + str(cluster))
    except rds.exceptions.DBClusterNotFoundFault:
        nile.delete_instance(cluster['type'], cluster['id'], access_token, soft_delete=False) # deleting for real
        logging.info("successful deleted cluster from Nile: " + cluster['properties']['cluster_name'])

if __name__ == "__main__":
    access_token = nile.login(username,password)
    nile.onEvent('clusters.created').handle(create_handler, access_token)
    nile.onEvent('clusters.soft-deleted').handle(delete_handler, access_token)

    [reconcile(instance) for instance in nile.get_instances('clusters', access_token)] # The python equivalent of get_instances().map(reconcile)


