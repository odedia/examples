## Setup
- Confluent Cloud CLI installed, logged in, properly configured (username/password, use API key/secret, use Kafka cluster, Kafka topic exists, etc)

  - Test it by running `confluent connect list` (should be blank)

- Snowflake snowsql installed, logged in, properly configured (~/.snowsql/config has valid info, database and warehouse exist)

  - Test it by running `snowsql`

- Snowflake configured to allow Confluent Cloud connector to write to it (see [documentation](https://docs.confluent.io/cloud/current/connectors/cc-snowflake-sink.html#snowflake-sink-connector-for-ccloud) and [worksheet](configs/snowflake/worksheet))

## From top-level folder

Modify `.env`. Edit:

```
NILE_ENTITY_NAME=ETL
```

Add:

```
ETL_CONFLUENT_KAFKA_CLUSTER
ETL_CONFLUENT_API_KEY
ETL_CONFLUENT_API_SECRET
ETL_CONFLUENT_CONNECTOR_NAME
ETL_CONFLUENT_KAFKA_TOPIC_NAME
ETL_SNOWFLAKE_URL
ETL_SNOWFLAKE_KEY
```

## Setup Nile control plane with the new ETL entity and some dummy instances

```
(cd quickstart && yarn nile-init)
(cd multi-tenancy && yarn start)
```

## Initialize a new entity instance

```
cd etl
python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
venv/bin/python src/entity_instance_init.py
```

## Update entity instance ETL source and destination 

```
venv/bin/python src/entity_instance_src.py
venv/bin/python src/entity_instance_dst.py
```

## Submit connector and update entity

```
source .env
confluent kafka topic create --if-not-exists ${ETL_CONFLUENT_KAFKA_TOPIC_NAME}
confluent connect create -vvv --config <(eval "cat <<EOF
$(<configs/confluentcloud/snowflake_sink_connector.json)
EOF
")
echo "Sleeping 60s" && sleep 60
venv/bin/python src/entity_instance_job.py
```

## Write and Read

```
source .env
./src/validate-pipeline.sh
```

## Delete the connector

Note: python code marks the entity instance status `Deleted` but the deletion happens asynchronously

```bash
source .env
venv/bin/python src/entity_instance_stop.py
CONNECTOR_ID=$(confluent connect list -o json | jq -r -e 'map(select(.name == "'${ETL_CONFLUENT_CONNECTOR_NAME}'")) | .[].id')
confluent connect delete ${CONNECTOR_ID}
```
