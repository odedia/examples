# Prereq: Confluent Cloud CLI and Snowflake snowsql installed, logged in, properly configured (username/passwords, API key/secret, clusters used, etc)

# From top-level folder
Modify .env: add/edit `NILE_ENTITY_NAME=ETL`

# Setup Nile control plane
(cd quickstart && yarn nile-init)
(cd multi-tenancy && yarn start)

# Setup ETL
cd etl
python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
venv/bin/python src/entity_instance_s0.py
venv/bin/python src/entity_instance_src.py
venv/bin/python src/entity_instance_dst.py
venv/bin/python src/entity_instance_job.py

# Submit connector
source .env
confluent connect create -vvv --config <(eval "cat <<EOF
$(<configs/confluentcloud/snowflake_sink_connector.json)
EOF
")

# Write and Read
./src/validate-pipeline.sh

## To delete
#create warehouse foo;
#use warehouse foo;
#drop warehouse foo;
