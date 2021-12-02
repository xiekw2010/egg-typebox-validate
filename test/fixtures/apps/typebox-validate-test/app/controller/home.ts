import { Controller } from 'egg';
import { Static, Type } from '@sinclair/typebox';

export default class HomeController extends Controller {
  public async create() {
    const { ctx } = this;
    const typebox = Type.Object({
      name: Type.String(),
      description: Type.Optional(Type.String()),
      email: Type.String({ format: 'email'}),
    })
    const res1 = ctx.tValidate(typebox, ctx.request.body);
    const res2 = ctx.tValidateWithoutThrow(typebox, ctx.request.body)
    const p: Static<typeof typebox> = ctx.request.body;
    ctx.body = {
      n: p.name,
      d: p.description,
      e: p.email,
      same: res1 === res2,
    }
  }
}
