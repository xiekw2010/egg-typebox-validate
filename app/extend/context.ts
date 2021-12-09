import { Schema } from 'ajv/dist/2019';

export default {
  tValidate(schema: Schema, data: unknown): boolean {
    const ajv = this.app.ajv;
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
    const res = this.app.ajv.validate(schema, data);
    return res;
  },
};
