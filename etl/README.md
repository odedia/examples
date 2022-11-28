# Prereq: Confluent Cloud CLI and Snowflake snowsql installed, logged in, properly configured (username/passwords, API key/secret, clusters used, etc)

# From top-level folder
Modify .env: add/edit `NILE_ENTITY_NAME=ETL`

# Setup Nile control plane with the new ETL entity and some dummy instances
(cd quickstart && yarn nile-init)
(cd multi-tenancy && yarn start)

# Initialize a new entity instance
cd etl
python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
venv/bin/python src/entity_instance_init.py

# Update entity instance ETL source and destination 
venv/bin/python src/entity_instance_src.py
venv/bin/python src/entity_instance_dst.py

# Submit connector and update entity
source .env
confluent connect create -vvv --config <(eval "cat <<EOF
$(<configs/confluentcloud/snowflake_sink_connector.json)
EOF
")
echo "Sleeping 60s" && sleep 60
venv/bin/python src/entity_instance_job.py

# Write and Read
./src/validate-pipeline.sh

# Delete the connector
# Note: python code marks the entity instance status `Deleted` but the deletion happens asynchronously
source .env
venv/bin/python src/entity_instance_stop.py
CONNECTOR_ID=$(confluent connect list -o json | jq -r -e 'map(select(.name == "'${ETL_CONFLUENT_CONNECTOR_NAME}'")) | .[].id')
confluent connect delete ${CONNECTOR_ID}
