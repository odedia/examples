#!/bin/sh

# A paused Confluent Cloud connector is still active and hourly base costs for tasks assigned to the connector continue to accrue

randomValue=$((1 + $RANDOM % 100000))
record='{"orderid":'"$randomValue"'}'
echo "\nNew record: ${record}"

# Read the current records with that randomValue
echo "\nCurrent records in Snowflake with orderid $randomValue"
snowsql -q "
create warehouse foo;
use warehouse foo;
select RECORD_CONTENT:orderid from MYKAFKATOPICROCKS where RECORD_CONTENT:orderid=$randomValue;
"

# Write the new record
echo "\nWrite new record to Confluent Cloud with orderid $randomValue"
echo "$record" | confluent kafka topic produce myKafkaTopicRocks
echo "Sleeping 60s"
sleep 60

# Read the current records again
echo "\nCurrent records in Snowflake with orderid $randomValue"
snowsql -q "
use warehouse foo;
select RECORD_CONTENT:orderid from MYKAFKATOPICROCKS where RECORD_CONTENT:orderid=$randomValue;
"

# Cleanup
#snowsql -q "drop warehouse foo;"
#confluent connect delete lcc-5w8kj2   
