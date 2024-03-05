import { AppPlugin } from '@grafana/data';

import { App } from './components/App';
import { AppConfig } from './components/AppConfig';

export const plugin = new AppPlugin<{}>().setRootPage(App).addConfigPage({
  body: AppConfig,
  icon: 'cog',
  id: 'configuration',
  title: 'Configuration',
});
