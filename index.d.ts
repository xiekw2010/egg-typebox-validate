import Ajv, { Schema } from 'ajv/dist/2019';

declare module 'egg' {
  export interface Application {
    ajv: Ajv;
  }

  export interface Context {
    tValidate: (schema: Schema, data: unknown) => boolean;
    tValidateWithoutThrow: (schema: Schema, data: unknown) => boolean;
  }

  interface EggAppConfig {
    typeboxValidate: {
      patchAjv: (ajv: Ajv) => void;
    };
  }
}
