import { Context } from 'egg';
import { TSchema } from "./typebox";
import { ErrorObject } from 'ajv/dist/2019';
declare type CustomErrorMessage = (ctx: Context, errors: ErrorObject[]) => string;
declare type GetData = (ctx: Context, args: unknown[]) => unknown;
export declare type ValidateRule = [TSchema, GetData, CustomErrorMessage?];
export declare function Validate(rules: ValidateRule[]): MethodDecorator;
