import Benchmark from 'benchmark';
import addFormats from 'ajv-formats';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import Parameter from 'parameter';

const getAjvInstance = () =>
  addFormats(new Ajv({}), [
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
    'regex',
  ])
    .addKeyword('kind')
    .addKeyword('modifier');

const suite = new Benchmark.Suite;

const DATA = {
  name: 'xiekw2010',
  description: 'desc',
  location: 'shanghai',
}


// add tests
suite
  .add('#ajv', function() {
    const rule = Type.Object({
      name: Type.String(),
      description: Type.Optional(Type.String()),
      location: Type.Enum({shanghai: 'shanghai', hangzhou: 'hangzhou'}),
    })
    const ajv = getAjvInstance();
    ajv.validate(rule, DATA);
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
    const p = new Parameter();
    p.validate(rule, DATA);
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });


//const start = new Date();
//const rule = Type.Object({
//  name: Type.String(),
//  description: Type.Optional(Type.String()),
//  location: Type.Enum({shanghai: 'shanghai', hangzhou: 'hangzhou'}),
//})
//const ajv = getAjvInstance();
//ajv.validate(rule, DATA);
//console.log('end is', new Date() - start);

//const start = new Date();
//const rule = {
//  name: 'string',
//  description: {
//    type: 'string',
//    required: false,
//  },
//  location: ['shanghai', 'hangzhou'],
//}
//const p = new Parameter();
//p.validate(rule, DATA);
//console.log('end is', new Date() - start);
