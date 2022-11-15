import { Attribute } from '@theniledev/react';

type Fields = {
  fields: Attribute[];
  columns: string[];
  instanceName: string;
};
export const getFormFields = (entity: string): void | Fields => {
  try {
    const entityModuleFormFields = require(`./${entity}/index.ts`);
    return entityModuleFormFields;
  } catch (err) {
    console.error(err);
    console.error(`Did you check that webapp/form-fields/${entity}/index.ts exists?`);
  }
};
