#!/bin/sh

# A paused Confluent Cloud connector is still active and hourly base costs for tasks assigned to the connector continue to accrue

source .env

randomValue=$((1 + $RANDOM % 100000))
record='{"orderid":'"$randomValue"'}'
echo "\nNew record: ${record}"

# Read the current records with that randomValue
echo "\nCurrent records in Snowflake with orderid $randomValue"
snowsql -q "
create warehouse foo;
use warehouse foo;
select RECORD_CONTENT:orderid from ${ETL_CONFLUENT_KAFKA_TOPIC_NAME} where RECORD_CONTENT:orderid=$randomValue;
"

# Write the new record
echo "\nWrite new record to Confluent Cloud with orderid $randomValue"
echo "$record" | confluent kafka topic produce ${ETL_CONFLUENT_KAFKA_TOPIC_NAME}
echo "Sleeping 60s" && sleep 60

# Read the current records again
echo "\nCurrent records in Snowflake with orderid $randomValue"
snowsql -q "
use warehouse foo;
select RECORD_CONTENT:orderid from ${ETL_CONFLUENT_KAFKA_TOPIC_NAME} where RECORD_CONTENT:orderid=$randomValue;
"
