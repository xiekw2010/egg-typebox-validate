import { Context } from 'egg';
import { TSchema } from "@sinclair/typebox";
export declare type ValidateRule = [TSchema, (ctx: Context, args: unknown[]) => unknown];
export declare function Validate(rules: ValidateRule[]): MethodDecorator;
