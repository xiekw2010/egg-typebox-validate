import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.keys = '123456';

  return {
    ...config,
  };
};
