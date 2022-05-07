import json
import boto3
import os
from nile import nile
from datetime import datetime

url = os.environ.get('NILE_URL', 'http://localhost:8080')
#ID is temporary, until we route by workspace name or entire base urls for a workspace
workspace_id = os.environ.get('NILE_WORKSPACE_ID','4')
username = os.environ.get('NILE_TENANT_USERNAME','gwen@demo.com')
password = os.environ.get('NILE_TENANT_PASSWORD','verysecret')
mysql_default_password =  os.environ.get('MYSQL_DEFAULT_PWD','changeme')

nile = nile.NileClient(url, workspace_id)
rds = boto3.client('rds')


def handler(event):
    updates = {}
    if event['status'] == 'create_requested':
        # Do a thing
        new_cluster =  rds.create_db_cluster(
            Engine='aurora-mysql',
            DBClusterIdentifier=event['cluster_name'],
            MasterUserPassword=mysql_default_password,
            MasterUsername="root")
        # Map the response to updates that will be made to the cluster in Nile 
        # All updated fields must be property of the Clusters entity
        updates['status'] = new_cluster['DBCluster']['Status']
        updates['Endpoint'] = new_cluster['DBCluster']['Endpoint']
        updates['ARN'] = new_cluster['DBCluster']['DBClusterArn']
        updates['updated'] = str(datetime.now())
        return updates
    if event['status'] == 'delete_requested':
        deleted = rds.delete_db_cluster(
            DBClusterIdentifier=event['cluster_name'],
            SkipFinalSnapshot=True)
        updates['status'] = deleted['DBCluster']['Status']
        updates['updated'] = str(datetime.now())
        return updates

def checker(event):
    updates = {}   
    try:
        clusters = rds.describe_db_clusters(DBClusterIdentifier=event['cluster_name'])
    except rds.exceptions.DBClusterNotFoundFault:
        return None
    updates['status'] = clusters['DBClusters'][0]['Status']
    updates['updated'] = str(datetime.now())
    return updates


if __name__ == "__main__":
    access_token = nile.login(username,password)
    (success, fail) = nile.handle_events('clusters-v2', access_token, handler, 'create_requested','delete_requested')
    print ("events handled successfully: ")
    print (*success, sep="\n")
    print ("events with errors: ")
    print (*fail, sep="\n")
    (success, fail) = nile.update_state('clusters-v2', access_token, checker)
    print ("state updated successfully: ")
    print (*success, sep="\n")
    print ("updates with errors: ")
    print (*fail, sep="\n")

