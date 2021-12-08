import addFormats from 'ajv-formats';
import Ajv, { Schema } from 'ajv/dist/2019';
import keyWords from 'ajv-keywords';

const getAjvInstance = () => {
  const ajv = new Ajv();
  keyWords(ajv, 'transform');
  addFormats(ajv, [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex',
  ])
    .addKeyword('kind')
    .addKeyword('modifier');
  return ajv;
};

const ajv = getAjvInstance();

export default {
  tValidate(schema: Schema, data: unknown): boolean {
    const res = ajv.validate(schema, data);
    if (!res) {
      this.throw(422, 'Validation Failed', {
        code: 'invalid_param',
        errorData: data,
        currentSchema: JSON.stringify(schema),
        errors: ajv.errors,
      });
    }
    return res;
  },

  tValidateWithoutThrow(schema: Schema, data: unknown): boolean {
    const res = ajv.validate(schema, data);
    return res;
  },
};
