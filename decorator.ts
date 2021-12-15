import { Context } from 'egg';
import { TSchema } from "@sinclair/typebox";

export type ValidateRule = [TSchema, (ctx: Context, args: unknown[]) => unknown];

export function Validate(rules: ValidateRule[]): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const fn = descriptor.value;
    descriptor.value = async function(...args) {
      const { ctx } = this;
      for (const rule of rules) {
        const getData = rule[1];
        ctx.tValidate(rule[0], getData(ctx, args));
      }
      return await fn.apply(this, args);
    };
    return descriptor;
  };
}
