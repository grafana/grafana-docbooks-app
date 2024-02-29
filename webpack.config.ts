import ReplaceInFileWebpackPlugin from 'replace-in-file-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import { DIST_DIR } from './.config/webpack/constants';
import { getPackageJson, getPluginJson } from './.config/webpack/utils';

import getBaseConfig from './.config/webpack/webpack.config';


const config = async (env): Promise<Configuration> => {
  console.log('Webpack is using base directory override');

  const baseConfig = await getBaseConfig(env);

  const pluginJson = getPluginJson();

  return merge(baseConfig, {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          // If src/README.md exists use it; otherwise the root README
          // To `compiler.options.output`
          { from: '../datasources/grafana-docbooks-datasource/src/plugin.json', to: './datasources/grafana-docbooks-datasource' },
          { from: '../datasources/grafana-docbooks-datasource/src/img/logo.svg', to: './datasources/grafana-docbooks-datasource/img' },
        ],
      }),
  
      // Replace certain template-variables in the README and plugin.json
      new ReplaceInFileWebpackPlugin([
        {
          dir: DIST_DIR,
          files: ['datasources/grafana-docbooks-datasource/plugin.json'],
          rules: [
            {
              search: /\%VERSION\%/g,
              replace: getPackageJson().version,
            },
            {
              search: /\%TODAY\%/g,
              replace: new Date().toISOString().substring(0, 10),
            },
            {
              search: /\%PLUGIN_ID\%/g,
              replace: pluginJson.id,
            },
          ],
        },
      ]),
    ],
  });
};

export default config;
