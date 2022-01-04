import { Context } from 'egg';
import { TSchema } from "./typebox";
import { ErrorObject } from 'ajv/dist/2019';

type CustomErrorMessage = (ctx: Context, errors: ErrorObject[]) => string;
type GetData =  (ctx: Context, args: unknown[]) => unknown;
export type ValidateRule = [TSchema, GetData, CustomErrorMessage?];

export function Validate(rules: ValidateRule[]): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const fn = descriptor.value;
    descriptor.value = async function(...args) {
      const { ctx, app } = this;
      for (const rule of rules) {
        const [schema, getData, customError] = rule;
        const data = getData(ctx, args);
        const valid = ctx.tValidateWithoutThrow(schema, data);
        if (!valid) {
          const message = customError ? customError(ctx, app.ajv.errors) : 'Validation Failed';
          ctx.throw(422, message, {
            code: 'invalid_param',
            errorData: data,
            currentSchema: JSON.stringify(schema),
            errors: app.ajv.errors,
          });
        }
      }
      return await fn.apply(this, args);
    };
    return descriptor;
  };
}
