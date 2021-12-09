import { Application } from 'egg';
import addFormats from 'ajv-formats';
import Ajv from 'ajv/dist/2019';
import keyWords from 'ajv-keywords';

const getAjvInstance = () => {
  const ajv = new Ajv();
  keyWords(ajv, 'transform');
  addFormats(ajv, [
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
  return ajv;
};

type ApplicationWithAjv = Application & { ajv: Ajv };

export default class AppBootHook {
  public app: ApplicationWithAjv;

  constructor(app: ApplicationWithAjv) {
    this.app = app;
    this.app.ajv = getAjvInstance();
  }

  async configDidLoad() {
    const config = this.app.config;
    const typeboxValidate = config.typeboxValidate;
    if (typeboxValidate) {
      const patchAjv = typeboxValidate.patchAjv;
      patchAjv && patchAjv(this.app.ajv);
    }
  }
}
