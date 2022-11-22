import { AttributeType } from '@theniledev/react';

/**
 * manually created from entity_definition.json
 */
const fields = [
  { name: 'name', label: 'ETL name', required: true },
  {
    name: 'src_type',
    label: 'Source',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'confluentcloud',
    options: [
      { label: 'Confluent Cloud', value: 'confluentcloud' },
    ],
  },
  {
    name: 'src_bootstrapServers',
    label: 'Bootstrap Servers',
    required: true,
    defaultValue: 'xyz.us-central1.gcp.confluent.cloud:9092',
  },
  {
    name: 'src_apiKey',
    label: 'API key',
    required: true,
    defaultValue: 'myKey',
  },
  {
    name: 'src_apiSecret',
    label: 'API secret',
    required: true,
    defaultValue: 'mySecret',
  },
  {
    name: 'src_topic',
    label: 'Kafka topic',
    required: true,
    defaultValue: 'myTopic',
  },
  {
    name: 'src_dataformat',
    label: 'Data format',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'json',
    options: [ 
      { label: 'json', value: 'json' },
    ],
  },
  {
    name: 'dst_type',
    label: 'Destination',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'snowflake',
    options: [ 
      { label: 'Snowflake', value: 'snowflake' },
    ],
  },
  { 
    name: 'dst_url',
    label: 'URL',
    required: true,
    defaultValue: 'https://abc.us-central1.gcp.snowflakecomputing.com:443',
  },
  { 
    name: 'dst_user',
    label: 'user',
    required: true,
    defaultValue: 'simon',
  },
  { 
    name: 'dst_key',
    label: 'key',
    required: true,
    defaultValue: 'mykey',
  },
  { 
    name: 'dst_db',
    label: 'Database',
    required: true,
    defaultValue: 'myDB',
  },
  { 
    name: 'dst_schema',
    label: 'Schema',
    required: true,
    defaultValue: 'mySchema',
  },
];

const columns = [
  'name',
  'src_type',
  'src_bootstrapServers',
  'src_apiKey',
  'src_apiSecret',
  'src_topic',
  'src_dataformat',
  'dst_type',
  'dst_url',
  'dst_user',
  'dst_key',
  'dst_db',
  'dst_schema',
  'job',
  'status',
];

const instanceName = 'name';

export { instanceName, fields, columns };
