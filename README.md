# egg-typebox-validate

## 为什么有这个项目

一直以来，在 typescript 的 egg 项目里，对参数校验 ctx.validate 是比较难受的，比如:

```js
class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // 写一遍 js 的类型校验
    ctx.validate({
      id: 'string',
      name: {
        type: 'string',
        required: false,
      },
      timestamp: {
        type: 'number',
        required: false,
      },
    }, ctx.params);
    
    // 写一遍 ts 的类型定义，为了后面拿参数定义
    const params: {
      id: string;
      name?: string;
      timestamp: number;
    } = ctx.params;
    ...
    ctx.body = params.id;
  }
}

export default HomeController;
```

可以看到这里我们写了两遍的类型定义，一遍 js 的定义（用 [parameter](https://github.com/node-modules/parameter) 库的规则），另一遍用 ts 的方式来强转我们的参数类型，方便我们后面写代码的时候能得到 ts 的类型效果。
对于简单的类型写起来还好，但是对于复杂点的参数定义，开发体验就不是那么好了。

这就是这个库想要解决的问题，对于参数校验，写一遍类型就够了：

```diff
+ import { Static, Type } from '@sinclair/typebox';

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // 写 js 类型定义
-   ctx.validate({
-     id: 'string',
-     name: {
-       type: 'string',
-       required: false,
-     },
-     timestamp: {
-       type: 'number',
-       required: false,
-     },
-   }, ctx.params);

+   const paramsSchema = Type.Object({
+     id: Type.String(),
+     name: Type.String(),
+     timestamp: Type.Integer(),
+   });
    // 直接校验
+   ctx.tValidate(paramsSchema, ctx.params);
    // 不用写 js 类型定义
+   const params: Static<typeof paramsSchema> = ctx.params;
-   const params: {
-     id: string;
-     name?: string;
-     timestamp: number;
-   } = ctx.params;
    ...
    ctx.body = params.id;
  }
}

export default HomeController;
```

## 怎么使用

1. 安装

```js
npm i egg-typebox-validate -D
```

2. 在项目中配置

```js
// config/plugin.ts
const plugin: EggPlugin = {
  typeboxValidate: {
    enable: true,
    package: 'egg-typebox-validate',
  },
};
```

3. 在业务代码中使用

```diff
+ import { Static, Type } from '@sinclair/typebox';

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    
+   const paramsSchema = Type.Object({
+     id: Type.String(),
+     name: Type.String(),
+     timestamp: Type.Integer(),
+   });
    // 直接校验
+   ctx.tValidate(paramsSchema, ctx.params);
    // 不用写 js 类型定义
+   const params: Static<typeof paramsSchema> = ctx.params;

    ...
  }
}

export default HomeController;
```

## 除了类型定义 write once 外，还有更多好处

1. 类型组合方式特别香，能解决很多 DRY(Don't Repeat Yourself) 问题。比如有几张 db 表，都定义了 name 必填和 description 选填，那这个规则可以在各个实体类方法中被组合了。

Show me the code!

```js
export const TYPEBOX_NAME_DESC_OBJECT = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
});

// type NameAndDesc = { name: string; description?: string }
type NameAndDesc = Static<typeof TYPEBOX_NAME_DESC_OBJECT>;

// controller User
async create() {
  const { ctx } = this;
  const USER_TYPEBOX = Type.Intersect([
    TYPEBOX_NAME_DESC_OBJECT,
    Type.Object({ avatar: Type.String() }),
  ])
  ctx.tValidate(USER_TYPEBOX, ctx.body);
  
  // 在编辑器都能正确得到提示
  // type User = { name: string; description?: string } & { avatar: string }
  const { name, description, avatar } = ctx.body as Static<typeof USER_TYPEBOX>;
  ...
}

// controller Photo
async create() {
  const { ctx } = this;
  const PHOTO_TYPEBOX = Type.Intersect([
    TYPEBOX_NAME_DESC_OBJECT,
    Type.Object({ location: Type.String() }),
  ])
  ctx.tValidate(PHOTO_TYPEBOX, ctx.body);

  // 在编辑器都能正确得到提示
  // type Photo = { name: string; description?: string } & { location: string }
  const { name, description, location } = ctx.body as Static<typeof PHOTO_TYPEBOX>;
  ...
}
```

2. 校验规则使用的是业界标准的 [json-schema](https://json-schema.org/) 规范，内置很多[开箱即用的类型](https://github.com/ajv-validator/ajv-formats#formats)。
 
```js
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
'regex'
```

3. 写定义的时候写的是 js 对象(`Type.Number()`)，有提示不容易写错。写 parameter 规范的时候，写字符串(`'nunber'`)有时候会不小心写错 😂。

## 与 egg-validate 性能比较

egg-typebox-validate 底层使用的是 [ajv](https://github.com/ajv-validator/ajv), 官网上宣称 `The fastest JSON validator for Node.js and browser.`

但是 parameter 跑了 [benchmark](./benchmark/ajv-vs-paramter.mjs) 后，它完败（不是一个数量级的），毕竟底层实现是完全不一样的。

## 从 egg-validate 迁移到这个库的成本


