import Ajv, { Schema } from 'ajv/dist/2019';

declare module 'egg' {
  interface Context {
    tValidate: (schema: Schema, data: unknown) => boolean;
    tValidateWithoutThrow: (schema: Schema, data: unknown) => boolean;
  }
}
