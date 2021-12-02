# egg-typebox-validate

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-typebox-validate.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-typebox-validate
[travis-image]: https://img.shields.io/travis/xiekw2010/egg-typebox-validate.svg?style=flat-square
[travis-url]: https://travis-ci.org/xiekw2010/egg-typebox-validate
[codecov-image]: https://img.shields.io/codecov/c/github/xiekw2010/egg-typebox-validate.svg?style=flat-square
[codecov-url]: https://codecov.io/github/xiekw2010/egg-typebox-validate?branch=master
[david-image]: https://img.shields.io/david/xiekw2010/egg-typebox-validate.svg?style=flat-square
[david-url]: https://david-dm.org/xiekw2010/egg-typebox-validate
[snyk-image]: https://snyk.io/test/npm/egg-typebox-validate/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-typebox-validate
[download-image]: https://img.shields.io/npm/dm/egg-typebox-validate.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-typebox-validate

基于 [typebox](https://github.com/sinclairzx81/typebox) 和 [ajv](https://github.com/ajv-validator/ajv) 封装的 egg validate 插件。

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
+     name: Type.Optional(Type.String()),
+     timestamp: Type.Optional(Type.Integer()),
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

用 `Static<typeof typebox>` 推导出的 ts 类型：

![tpian](https://gw.alipayobjects.com/zos/antfincdn/XjH2W7lEB/ad5b628c-9ff9-456d-bb7b-2fb0ac418f1c.png)


## 怎么使用

1. 安装

```js
npm i egg-typebox-validate -S
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

// 写在 controller 外面，静态化，性能更好，下面有 benchmark
+ const paramsSchema = Type.Object({
+   id: Type.String(),
+   name: Type.String(),
+   timestamp: Type.Integer(),
+ });

// 可以直接 export 出去，给下游 service 使用
+ export type ParamsType = Static<typeof paramsSchema>;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    
    // 直接校验
+   ctx.tValidate(paramsSchema, ctx.params);
    // 不用写 js 类型定义
+   const params: ParamsType = ctx.params;

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
  ctx.tValidate(USER_TYPEBOX, ctx.request.body);
  
  // 在编辑器都能正确得到提示
  // type User = { name: string; description?: string } & { avatar: string }
  const { name, description, avatar } = ctx.request.body as Static<typeof USER_TYPEBOX>;
  ...
}

// controller Photo
async create() {
  const { ctx } = this;
  const PHOTO_TYPEBOX = Type.Intersect([
    TYPEBOX_NAME_DESC_OBJECT,
    Type.Object({ location: Type.String() }),
  ])
  ctx.tValidate(PHOTO_TYPEBOX, ctx.request.body);

  // 在编辑器都能正确得到提示
  // type Photo = { name: string; description?: string } & { location: string }
  const { name, description, location } = ctx.request.body as Static<typeof PHOTO_TYPEBOX>;
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

3. 写定义的时候写的是 js 对象(`Type.Number()`)，有类型提示，语法也比较简单，有提示不容易写错；写 parameter 规范的时候，写字符串(`'nunber'`)有时候会不小心写错 😂，再加上它对于复杂嵌套对象的写法还是比较困难的，我每次都会查文档，官方的文档也不全。但是 typebox，就很容易举一反三了。

## 与 egg-validate 性能比较

egg-typebox-validate 底层使用的是 [ajv](https://github.com/ajv-validator/ajv), 官网上宣称是 _**The fastest JSON validator for Node.js and browser.**_

结论是在静态化的场景下，ajv 的性能要比 parameter 好得多，快不是一个数量级，详见[benchmark](./benchmark/ajv-vs-parameter.mjs) 

```js
suite
  .add('#ajv', function() {
    const rule = Type.Object({
      name: Type.String(),
      description: Type.Optional(Type.String()),
      location: Type.Enum({shanghai: 'shanghai', hangzhou: 'hangzhou'}),
    })
    ajv.validate(rule, DATA);
  })
  .add('#ajv define once', function() {
    ajv.validate(typeboxRule, DATA);
  })
  .add('#parameter', function() {
    const rule = {
      name: 'string',
      description: {
        type: 'string',
        required: false,
      },
      location: ['shanghai', 'hangzhou'],
    }
    p.validate(rule, DATA);
  })
  .add('#parameter define once', function() {
    p.validate(parameterRule, DATA);
  })
```

在 MacBook Pro(2.2 GHz 六核Intel Core i7)上，跑出来结果是:

```bash
#ajv x 941 ops/sec ±3.97% (73 runs sampled)
#ajv define once x 17,188,370 ops/sec ±11.53% (73 runs sampled)
#parameter x 2,544,118 ops/sec ±4.68% (79 runs sampled)
#parameter define once x 2,541,590 ops/sec ±5.34% (77 runs sampled)
Fastest is #ajv define once
```

## 从 egg-validate 迁移到这个库的成本

1. 把原来字符串式 js 对象写法迁移到 typebox 的对象写法。typebox 的写法还算简单和容易举一反三
2. 把 `ctx.validate` 替换成 `ctx.tValidate`
3. 建议渐进式迁移，先迁简单的，对业务影响不大的

## 总结

切换到 egg-typebox-validate 校验后：

1. 可以解决 ts 项目中参数校验代码写两遍类型的问题，提升代码重用率，可维护性等问题
2. 用标准 json-schema 来做参数校验，是更加标准的业界做法，内置更多业界标准模型

## API

1. `ctx.tValidate` 参数校验失败后，抛出错误，内部实现（错误码、错误标题等）逻辑和 `ctx.validate` 的保持一致

```diff
+ import { Static, Type } from '@sinclair/typebox';

ctx.tValidate(Type.Object({
  name: Type.String(),
}), ctx.request.body);
```

2. `ctx.tValidateWithoutThrow` 直接校验，不抛出错误

```diff
+ import { Static, Type } from '@sinclair/typebox';

const valid = ctx.tValidateWithoutThrow(Type.Object({
  name: Type.String(),
}), ctx.request.body);

if (valid) {
  ...
} else {
  ...
}

```

## 怎么写 typebox 定义

参考 [https://github.com/sinclairzx81/typebox#types](https://github.com/sinclairzx81/typebox#types)

## License

[MIT](LICENSE)
