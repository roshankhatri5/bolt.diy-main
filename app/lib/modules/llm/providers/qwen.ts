import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const QWEN_OAUTH_BASE_URL = 'https://chat.qwen.ai';
const QWEN_OAUTH_TOKEN_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/token`;
const QWEN_OAUTH_CLIENT_ID = 'f0304373b74a44d2b584a3fb70ca9e56';
const QWEN_DIR = '.qwen';
const QWEN_CREDENTIAL_FILENAME = 'oauth_creds.json';

interface QwenOAuthCredentials {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  resource_url?: string;
}

export default class QwenProvider extends BaseProvider {
  name = 'Qwen';
  getApiKeyLink = 'https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key';
  labelForGetApiKey = 'Get Qwen OAuth Token';
  icon = 'i-simple-icons:alibabadotcom';

  private credentials: QwenOAuthCredentials | null = null;
  private credentialsPath?: string;
  private refreshPromise: Promise<QwenOAuthCredentials> | null = null;
  private nodeDepsPromise:
    | Promise<{
        fs: typeof import('node:fs/promises');
        os: typeof import('node:os');
        path: typeof import('node:path');
      }>
    | null = null;

  config = {
    apiTokenKey: 'QWEN_API_KEY',
    baseUrlKey: 'QWEN_BASE_URL',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  };

  staticModels: ModelInfo[] = [
    // Qwen3 Coder Models - Latest coding-focused models with 1M context
    {
      name: 'qwen3-coder-plus',
      label: 'Qwen3 Coder Plus (1M context)',
      provider: 'Qwen',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 65536,
    },
    {
      name: 'qwen3-coder-flash',
      label: 'Qwen3 Coder Flash (1M context)',
      provider: 'Qwen',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 65536,
    },
    // Qwen2.5 Coder Models - Previous generation
    {
      name: 'qwen2.5-coder-32b-instruct',
      label: 'Qwen2.5 Coder 32B',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
    },
    {
      name: 'qwen-coder-plus',
      label: 'Qwen Coder Plus',
      provider: 'Qwen',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'qwen-coder-turbo',
      label: 'Qwen Coder Turbo',
      provider: 'Qwen',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    // Qwen Max Models
    {
      name: 'qwen-max',
      label: 'Qwen Max',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
    },
    {
      name: 'qwen-plus',
      label: 'Qwen Plus',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
    },
    {
      name: 'qwen-turbo',
      label: 'Qwen Turbo',
      provider: 'Qwen',
      maxTokenAllowed: 8192,
      maxCompletionTokens: 8192,
    },
  ];

  private async getNodeDeps() {
    if (typeof window !== 'undefined') {
      throw new Error('Qwen OAuth integration is only available in a server environment.');
    }

    if (!this.nodeDepsPromise) {
      this.nodeDepsPromise = Promise.all([
        import('node:fs/promises'),
        import('node:os'),
        import('node:path'),
      ]).then(([fs, os, path]) => ({ fs, os, path }));
    }

    return this.nodeDepsPromise;
  }

  private async getQwenCachedCredentialPath(customPath?: string): Promise<string> {
    const { os, path } = await this.getNodeDeps();

    if (customPath) {
      // Support custom path that starts with ~/ or is absolute
      if (customPath.startsWith('~/')) {
        return path.join(os.homedir(), customPath.slice(2));
      }
      return path.resolve(customPath);
    }

    return path.join(os.homedir(), QWEN_DIR, QWEN_CREDENTIAL_FILENAME);
  }

  private objectToUrlEncoded(data: Record<string, string>): string {
    return Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  }

  private async loadCachedQwenCredentials(oauthPath?: string): Promise<QwenOAuthCredentials> {
    const keyFile = await this.getQwenCachedCredentialPath(oauthPath);
    const { fs } = await this.getNodeDeps();

    try {
      const credsStr = await fs.readFile(keyFile, 'utf-8');
      this.credentialsPath = keyFile;
      return JSON.parse(credsStr);
    } catch (error) {
      throw new Error(
        `Failed to load Qwen OAuth credentials from ${keyFile}. Please ensure you have authenticated with Qwen.`,
      );
    }
  }

  private async refreshAccessToken(credentials: QwenOAuthCredentials): Promise<QwenOAuthCredentials> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = this.doRefreshAccessToken(credentials);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise after completion (success or failure)
      this.refreshPromise = null;
    }
  }

  private async doRefreshAccessToken(credentials: QwenOAuthCredentials): Promise<QwenOAuthCredentials> {
    if (!credentials.refresh_token) {
      throw new Error('No refresh token available in credentials.');
    }

    const bodyData = {
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
      client_id: QWEN_OAUTH_CLIENT_ID,
    };

    const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: this.objectToUrlEncoded(bodyData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }

    const tokenData = await response.json() as any;

    if (tokenData.error) {
      throw new Error(`Token refresh failed: ${tokenData.error} - ${tokenData.error_description}`);
    }

    const newCredentials = {
      ...credentials,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      refresh_token: tokenData.refresh_token || credentials.refresh_token,
      expiry_date: Date.now() + tokenData.expires_in * 1000,
    };

    const { fs } = await this.getNodeDeps();
    const filePath = this.credentialsPath || (await this.getQwenCachedCredentialPath());
    try {
      await fs.writeFile(filePath, JSON.stringify(newCredentials, null, 2));
    } catch (error) {
      console.error('Failed to save refreshed credentials:', error);
      // Continue with the refreshed token in memory even if file write fails
    }

    return newCredentials;
  }

  private isTokenValid(credentials: QwenOAuthCredentials): boolean {
    const TOKEN_REFRESH_BUFFER_MS = 30 * 1000; // 30s buffer
    if (!credentials.expiry_date) {
      return false;
    }
    return Date.now() < credentials.expiry_date - TOKEN_REFRESH_BUFFER_MS;
  }

  private async ensureAuthenticated(apiKey?: string, oauthPath?: string): Promise<string> {
    // If API key is provided directly, use it
    if (apiKey && !apiKey.includes('oauth')) {
      return apiKey;
    }

    // Otherwise, use OAuth authentication
    const keyFile = await this.getQwenCachedCredentialPath(oauthPath);

    if (!this.credentials || this.credentialsPath !== keyFile) {
      this.credentials = await this.loadCachedQwenCredentials(oauthPath);
    }

    if (!this.isTokenValid(this.credentials)) {
      this.credentials = await this.refreshAccessToken(this.credentials);
    }

    return this.credentials.access_token;
  }

  private getBaseUrl(credentials: QwenOAuthCredentials | null): string {
    if (!credentials || !credentials.resource_url) {
      return this.config.baseUrl!;
    }
    
    let baseUrl = credentials.resource_url;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    return baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const provider = this;
    const providerSpecificSettings = providerSettings?.[this.name];

    // Create a lazy-loading LanguageModelV1 that handles OAuth automatically
    return {
      specificationVersion: 'v1',
      provider: this.name,
      modelId: model,
      defaultObjectGenerationMode: undefined,

      async doGenerate(generateOptions) {
        const openaiModel = await provider.getOpenAIModel(options);
        return openaiModel.doGenerate(generateOptions);
      },

      async doStream(streamOptions) {
        const openaiModel = await provider.getOpenAIModel(options);
        return openaiModel.doStream(streamOptions);
      },
    };
  }

  private async getOpenAIModel(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): Promise<LanguageModelV1> {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const providerSpecificSettings = providerSettings?.[this.name];

    const { baseUrl: configBaseUrl, apiKey: configApiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSpecificSettings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'QWEN_BASE_URL',
      defaultApiTokenKey: 'QWEN_API_KEY',
    });

    const oauthPath = providerSpecificSettings?.qwenOauthPath as string | undefined;

    let finalApiKey = configApiKey;
    let finalBaseUrl = configBaseUrl || this.config.baseUrl!;

    // Always try to use OAuth credentials if no explicit API key is provided
    if (!finalApiKey) {
      try {
        const token = await this.ensureAuthenticated(undefined, oauthPath);
        finalApiKey = token;
        finalBaseUrl = this.getBaseUrl(this.credentials);
      } catch (error) {
        throw new Error(
          `Qwen OAuth credentials not found or expired. Please authenticate with 'qwen auth login' or provide an API key.`,
        );
      }
    }

    if (!finalApiKey) {
      throw new Error(`Missing API key for ${this.name} provider. Either provide an API key or authenticate with Qwen CLI.`);
    }

    const openai = createOpenAI({
      apiKey: finalApiKey,
      baseURL: finalBaseUrl,
    });

    return openai(model);
  }

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'QWEN_BASE_URL',
      defaultApiTokenKey: 'QWEN_API_KEY',
    });

    const oauthPath = settings?.qwenOauthPath as string | undefined;
    
    try {
      let finalApiKey = apiKey;
      let finalBaseUrl = baseUrl || this.config.baseUrl!;

      // Try OAuth if no API key provided
      if (!finalApiKey) {
        try {
          finalApiKey = await this.ensureAuthenticated(undefined, oauthPath);
          finalBaseUrl = this.getBaseUrl(this.credentials);
        } catch (error) {
          console.error('Failed to authenticate with OAuth for dynamic models:', error);
          return [];
        }
      }

      const response = await fetch(`${finalBaseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${finalApiKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch Qwen models:', response.statusText);
        return [];
      }

      const res = (await response.json()) as any;
      const staticModelNames = this.staticModels.map((m) => m.name);

      const data = res.data.filter(
        (model: any) =>
          model.object === 'model' &&
          !staticModelNames.includes(model.id) &&
          (model.id.includes('qwen') || model.id.includes('Qwen'))
      );

      return data.map((m: any) => {
        // Determine context window based on model name
        let contextWindow = 8192; // default
        if (m.id.includes('coder-plus') || m.id.includes('coder-flash')) {
          contextWindow = 1000000; // 1M context for latest coder models
        } else if (m.id.includes('max') || m.id.includes('plus')) {
          contextWindow = 32768;
        } else if (m.id.includes('turbo')) {
          contextWindow = 128000;
        }

        // Determine max completion tokens
        let maxCompletionTokens = 8192; // default
        if (m.id.includes('coder-plus') || m.id.includes('coder-flash')) {
          maxCompletionTokens = 65536;
        }

        return {
          name: m.id,
          label: `${m.id} (${Math.floor(contextWindow / 1000)}k context)`,
          provider: this.name,
          maxTokenAllowed: contextWindow,
          maxCompletionTokens,
        };
      });
    } catch (error) {
      console.error('Error getting dynamic models for Qwen:', error);
      return [];
    }
  }
}
