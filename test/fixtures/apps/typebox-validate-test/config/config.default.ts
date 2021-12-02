import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.keys = '123456';
  config.security = {
    csrf: {
      ignoreJSON: true,
    },
  }
  return {
    ...config,
  };
};
