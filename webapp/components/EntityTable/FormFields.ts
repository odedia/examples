import { AttributeType } from '@theniledev/react';

/**
 * manually created from https://github.com/TheNileDev/examples/blob/main/quickstart/src/models/SaaSDB_Entity_Definition.json
 * Customize these values to match your own entities
 */
const fields = [
  { name: 'dbName', label: 'Database name', required: true },
  {
    name: 'cloud',
    label: 'Cloud provider',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'aws',
    options: [
      { label: 'AWS', value: 'aws' },
      { label: 'GCP', value: 'gcp' },
      { label: 'Azure', value: 'azure' },
    ],
  },
  {
    name: 'environment',
    label: 'Environment',
    type: AttributeType.Select,
    defaultValue: 'test',
    options: [
      { label: 'Test', value: 'test' },
      { label: 'Development', value: 'dev' },
      { label: 'Production', value: 'prod' },
    ],
  },
  {
    name: 'size',
    label: 'Size',
    defaultValue: 2,
    type: AttributeType.Select,
    options: [
      { label: '2', value: 2 },
      { label: '4', value: 4 },
      { label: '6', value: 6 },
    ],
  },
];
export default fields;
