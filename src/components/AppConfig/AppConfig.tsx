import React, { ChangeEvent, useState } from 'react';

import { css } from '@emotion/css';
import { lastValueFrom } from 'rxjs';

import { AppPluginMeta, GrafanaTheme2, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Field, FieldSet, Input, SecretInput, useStyles2 } from '@grafana/ui';

import { testIds } from '../testIds';

export type AppPluginSettings = {
  apiUrl?: string;
};

type State = {
  // A secret key for our custom API.
  apiKey: string;
  // The URL to reach our custom API.
  apiUrl: string;
  // Tells us if the API key secret is set.
  isApiKeySet: boolean;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {}

export const AppConfig = ({ plugin }: AppConfigProps) => {
  const s = useStyles2(getStyles);
  const { enabled, jsonData, pinned, secureJsonFields } = plugin.meta;
  const [state, setState] = useState<State>({
    apiKey: '',
    apiUrl: jsonData?.apiUrl || '',
    isApiKeySet: Boolean(secureJsonFields?.apiKey),
  });

  const onResetApiKey = () =>
    setState({
      ...state,
      apiKey: '',
      isApiKeySet: false,
    });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.value.trim(),
    });
  };

  return (
    <div data-testid={testIds.appConfig.container}>
      <FieldSet label="API Settings">
        <Field label="API Key" description="A secret key for authenticating to our custom API">
          <SecretInput
            width={60}
            data-testid={testIds.appConfig.apiKey}
            name="apiKey"
            value={state.apiKey}
            isConfigured={state.isApiKeySet}
            placeholder={'Your secret API key'}
            onChange={onChange}
            onReset={onResetApiKey}
          />
        </Field>

        <Field label="API Url" description="" className={s.marginTop}>
          <Input
            width={60}
            name="apiUrl"
            data-testid={testIds.appConfig.apiUrl}
            value={state.apiUrl}
            placeholder={`E.g.: http://mywebsite.com/api/v1`}
            onChange={onChange}
          />
        </Field>

        <div className={s.marginTop}>
          <Button
            type="submit"
            data-testid={testIds.appConfig.submit}
            onClick={() =>
              updatePluginAndReload(plugin.meta.id, {
                enabled,
                jsonData: {
                  apiUrl: state.apiUrl,
                },
                pinned,
                // This cannot be queried later by the frontend.
                // We don't want to override it in case it was set previously and left untouched now.
                secureJsonData: state.isApiKeySet
                  ? undefined
                  : {
                      apiKey: state.apiKey,
                    },
              })
            }
            disabled={Boolean(!state.apiUrl || (!state.isApiKeySet && !state.apiKey))}
          >
            Save API settings
          </Button>
        </div>
      </FieldSet>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  colorWeak: css`
    color: ${theme.colors.text.secondary};
  `,
  marginTop: css`
    margin-top: ${theme.spacing(3)};
  `,
});

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<AppPluginSettings>>) => {
  try {
    await updatePlugin(pluginId, data);

    // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
    // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    window.location.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().fetch({
    data,
    method: 'POST',
    url: `/api/plugins/${pluginId}/settings`,
  });

  return lastValueFrom(response);
};
