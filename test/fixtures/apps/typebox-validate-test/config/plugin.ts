import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  typeboxValidate: {
    enable: true,
    package: 'egg-typebox-validate',
  },
};

export default plugin;
