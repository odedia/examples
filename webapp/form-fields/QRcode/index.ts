/**
 * manually created from entity_definition.json
 */
const fields = [
  { name: 'campaignName', label: 'Campaign name for QR code', required: true },
  { name: 'targetPage', label: 'Target landing page', defaultValue: "https://", required: true },
];

const columns = ['campaignName', 'targetPage', 'generatedQRCode', 'status'];

const instanceName = 'campaignName';

export { instanceName, fields, columns };
