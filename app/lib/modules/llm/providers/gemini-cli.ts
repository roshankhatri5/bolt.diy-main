import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import type { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('GeminiCLI');

// OAuth2 Configuration
const OAUTH_REDIRECT_URI = 'http://localhost:45289';

// Code Assist API Configuration
const CODE_ASSIST_ENDPOINT = 'https://cloudcode-pa.googleapis.com';
const CODE_ASSIST_API_VERSION = 'v1internal';

interface OAuthCredentials {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
}

interface OauthConfig {
  oauthClientId: string;
  oauthClientSecret: string;
}

export default class GeminiCliProvider extends BaseProvider {
  name = 'GeminiCLI';
  getApiKeyLink = 'https://console.cloud.google.com/getting-started';
  labelForGetApiKey = 'Set up Google Cloud OAuth';
  icon = 'i-simple-icons:google';

  config = {
    apiTokenKey: 'GEMINI_CLI_OAUTH_TOKEN',
  };

  private authClient: OAuth2Client | null = null;
  private credentials: OAuthCredentials | null = null;
  private oauthClientId: string | null = null;
  private oauthClientSecret: string | null = null;
  private projectId: string | null = null;

  staticModels: ModelInfo[] = [
    // Gemini 2.0 Flash models
    {
      name: 'gemini-2.0-flash-001',
      label: 'Gemini 2.0 Flash 001',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
    },
    {
      name: 'gemini-2.0-flash-thinking-exp-01-21',
      label: 'Gemini 2.0 Flash Thinking (Experimental)',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 65536,
    },
    {
      name: 'gemini-2.0-flash-exp',
      label: 'Gemini 2.0 Flash (Experimental)',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
    },
    // Gemini 2.5 models with reasoning
    {
      name: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 64000,
    },
    {
      name: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 64000,
    },
    // Gemini 1.5 Flash models
    {
      name: 'gemini-1.5-flash-002',
      label: 'Gemini 1.5 Flash 002',
      provider: 'GeminiCLI',
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
    },
    // Gemini 1.5 Pro models
    {
      name: 'gemini-1.5-pro-002',
      label: 'Gemini 1.5 Pro 002',
      provider: 'GeminiCLI',
      maxTokenAllowed: 2097152,
      maxCompletionTokens: 8192,
    },
    // Experimental models
    {
      name: 'gemini-exp-1206',
      label: 'Gemini Experimental 1206',
      provider: 'GeminiCLI',
      maxTokenAllowed: 2097152,
      maxCompletionTokens: 8192,
    },
  ];

  private async fetchOAuthConfig(): Promise<void> {
    if (this.oauthClientId && this.oauthClientSecret) {
      return;
    }

    try {
      const response = await axios.get<{ geminiCli: OauthConfig }>(
        'https://api.kilocode.ai/extension-config.json',
      );
      const config = response.data;

      this.oauthClientId = config.geminiCli.oauthClientId;
      this.oauthClientSecret = config.geminiCli.oauthClientSecret;
      logger.info('OAuth config fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch OAuth config:', error);
      throw new Error('OAuth client credentials not found in config');
    }
  }

  private ensureProcessEnv(): void {
    const globalScope = globalThis as typeof globalThis & { process?: any };

    const processObj: any = globalScope.process ?? (globalScope.process = { env: {} });
    const env: Record<string, string | undefined> = processObj.env ?? (processObj.env = {});

    if (typeof env.NODE_ENV === 'undefined') {
      env.NODE_ENV = 'development';
    }

    if (typeof env.GOOGLE_SDK_NODE_LOGGING === 'undefined') {
      env.GOOGLE_SDK_NODE_LOGGING = '';
    }
  }

  private async ensureAuthClient(): Promise<OAuth2Client> {
    if (this.authClient) {
      return this.authClient;
    }

    await this.fetchOAuthConfig();

    if (!this.oauthClientId || !this.oauthClientSecret) {
      throw new Error('OAuth client credentials not loaded');
    }

    this.ensureProcessEnv();

    const { OAuth2Client } = await import('google-auth-library');
    this.authClient = new OAuth2Client(this.oauthClientId, this.oauthClientSecret, OAUTH_REDIRECT_URI);
    return this.authClient;
  }

  private async loadOAuthCredentials(): Promise<void> {
    try {
      // Check if credentials exist in localStorage (browser environment)
      if (typeof window !== 'undefined') {
        const credData = localStorage.getItem('gemini-cli-credentials');
        if (credData) {
          this.credentials = JSON.parse(credData);
          
          // Set credentials on the OAuth2 client
          if (this.credentials) {
            const authClient = await this.ensureAuthClient();
            authClient.setCredentials({
              access_token: this.credentials.access_token,
              refresh_token: this.credentials.refresh_token,
              expiry_date: this.credentials.expiry_date,
            });
          }
          return;
        }
      }
      
      throw new Error('Gemini CLI OAuth credentials not found. Please authenticate first.');
    } catch (error) {
      logger.error('Failed to load OAuth credentials:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const authClient = await this.ensureAuthClient();

    if (!this.credentials) {
      await this.loadOAuthCredentials();
    }

    // Check if token needs refresh
    if (this.credentials && this.credentials.expiry_date < Date.now()) {
      try {
        const { credentials } = await authClient.refreshAccessToken();
        if (credentials.access_token) {
          this.credentials = {
            access_token: credentials.access_token!,
            refresh_token: credentials.refresh_token || this.credentials.refresh_token,
            token_type: credentials.token_type || 'Bearer',
            expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
          };
          
          // Save refreshed credentials to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('gemini-cli-credentials', JSON.stringify(this.credentials));
          }

          authClient.setCredentials({
            access_token: this.credentials.access_token,
            refresh_token: this.credentials.refresh_token,
            expiry_date: this.credentials.expiry_date,
          });
        }
      } catch (error) {
        logger.error('Failed to refresh token:', error);
        throw new Error('Failed to refresh Gemini CLI token');
      }
    }
  }

  private async discoverProjectId(): Promise<string> {
    // If we've already discovered it, return it
    if (this.projectId) {
      return this.projectId;
    }

    const initialProjectId = 'default';

    // Prepare client metadata
    const clientMetadata = {
      ideType: 'IDE_UNSPECIFIED',
      platform: 'PLATFORM_UNSPECIFIED',
      pluginType: 'GEMINI',
      duetProject: initialProjectId,
    };

    try {
      // Call loadCodeAssist to discover the actual project ID
      const loadRequest = {
        cloudaicompanionProject: initialProjectId,
        metadata: clientMetadata,
      };

      const loadResponse = await this.callEndpoint('loadCodeAssist', loadRequest);

      // Check if we already have a project ID from the response
      if (loadResponse.cloudaicompanionProject) {
        this.projectId = loadResponse.cloudaicompanionProject;
        return this.projectId as string;
      }

      // If no existing project, we need to onboard
      const defaultTier = loadResponse.allowedTiers?.find((tier: any) => tier.isDefault);
      const tierId = defaultTier?.id || 'free-tier';

      const onboardRequest = {
        tierId: tierId,
        cloudaicompanionProject: initialProjectId,
        metadata: clientMetadata,
      };

      let lroResponse = await this.callEndpoint('onboardUser', onboardRequest);

      // Poll until operation is complete with timeout protection
      const MAX_RETRIES = 30;
      let retryCount = 0;

      while (!lroResponse.done && retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        lroResponse = await this.callEndpoint('onboardUser', onboardRequest);
        retryCount++;
      }

      if (!lroResponse.done) {
        throw new Error('Onboarding timeout');
      }

      const discoveredProjectId = lroResponse.response?.cloudaicompanionProject?.id || initialProjectId;
      this.projectId = discoveredProjectId;
      return this.projectId as string;
    } catch (error: any) {
      logger.error('Failed to discover project ID:', error);
      this.projectId = 'default';
      return this.projectId;
    }
  }

  private async callEndpoint(method: string, body: any, retryAuth: boolean = true): Promise<any> {
    const authClient = await this.ensureAuthClient();

    try {
      const res = await authClient.request({
        url: `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json',
        data: JSON.stringify(body),
      });
      return res.data;
    } catch (error: any) {
      logger.error(`Error calling ${method}:`, error);
      
      // If we get a 401 and haven't retried yet, try refreshing auth
      if (error.response?.status === 401 && retryAuth) {
        await this.ensureAuthenticated();
        return this.callEndpoint(method, body, false);
      }
      
      throw error;
    }
  }

  private async *parseSSEStream(stream: any): AsyncGenerator<any> {
    let buffer = '';

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (e) {
            logger.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv?: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const modelId = options.model;
    const provider = this;

    // Return a custom LanguageModelV1 implementation
    return {
      specificationVersion: 'v1',
      provider: this.name,
      modelId,
      defaultObjectGenerationMode: undefined,

      async doGenerate(options: any): Promise<any> {
        await provider.ensureAuthenticated();
        const authClient = await provider.ensureAuthClient();
        const projectId = await provider.discoverProjectId();

        const requestBody = {
          model: modelId,
          project: projectId,
          request: {
            contents: options.messages.map((msg: any) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 8192,
              topP: options.topP,
              topK: options.topK,
            },
          },
        };

        const response = await authClient.request({
          url: `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(requestBody),
        });

        const rawData = response.data as any;
        const responseData = rawData.response || rawData;

        if (responseData.candidates && responseData.candidates.length > 0) {
          const candidate = responseData.candidates[0];
          const textContent = candidate.content?.parts
            ?.filter((part: any) => part.text && !part.thought)
            .map((part: any) => part.text)
            .join('') || '';

          return {
            finishReason: candidate.finishReason === 'STOP' ? 'stop' : 'other',
            usage: {
              promptTokens: responseData.usageMetadata?.promptTokenCount || 0,
              completionTokens: responseData.usageMetadata?.candidatesTokenCount || 0,
            },
            text: textContent,
            warnings: [],
          };
        }

        throw new Error('No response from Gemini CLI');
      },

      async doStream(options: any): Promise<any> {
        await provider.ensureAuthenticated();
        const authClient = await provider.ensureAuthClient();
        const projectId = await provider.discoverProjectId();

        const requestBody = {
          model: modelId,
          project: projectId,
          request: {
            contents: options.messages.map((msg: any) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 8192,
              topP: options.topP,
              topK: options.topK,
            },
          },
        };

        const response = await authClient.request({
          url: `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:streamGenerateContent`,
          method: 'POST',
          params: { alt: 'sse' },
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
          data: JSON.stringify(requestBody),
        });

        let lastUsageMetadata: any = undefined;
        const textChunks: string[] = [];

        return {
          stream: (async function* () {
            for await (const jsonData of provider.parseSSEStream(response.data)) {
              const responseData = jsonData.response || jsonData;
              const candidate = responseData.candidates?.[0];

              if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                  if (part.text && !part.thought) {
                    textChunks.push(part.text);
                    yield {
                      type: 'text-delta',
                      textDelta: part.text,
                    };
                  }
                }
              }

              if (responseData.usageMetadata) {
                lastUsageMetadata = responseData.usageMetadata;
              }

              if (candidate?.finishReason) {
                break;
              }
            }

            yield {
              type: 'finish',
              finishReason: 'stop',
              usage: {
                promptTokens: lastUsageMetadata?.promptTokenCount || 0,
                completionTokens: lastUsageMetadata?.candidatesTokenCount || 0,
              },
            };
          })(),
          
          warnings: [],
          rawCall: { rawPrompt: null, rawSettings: {} },
        };
      },
    };
  }

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    try {
      // Try to authenticate and get available models from Code Assist API
      await this.ensureAuthenticated();
      const projectId = await this.discoverProjectId();

      // Prepare client metadata
      const clientMetadata = {
        ideType: 'IDE_UNSPECIFIED',
        platform: 'PLATFORM_UNSPECIFIED',
        pluginType: 'GEMINI',
        duetProject: projectId,
      };

      // Call loadCodeAssist to get available models
      const loadRequest = {
        cloudaicompanionProject: projectId,
        metadata: clientMetadata,
      };

      const loadResponse = await this.callEndpoint('loadCodeAssist', loadRequest);
      
      // Extract available models from the response
      const availableModels = loadResponse.availableModels || [];
      
      // Convert to ModelInfo format
      const dynamicModels: ModelInfo[] = availableModels.map((model: any) => ({
        name: model.name || model.modelId,
        label: model.displayName || model.name || model.modelId,
        provider: this.name,
        maxTokenAllowed: model.contextWindow || 1048576,
        maxCompletionTokens: model.maxTokens || 8192,
      }));

      // If no dynamic models found, return empty array (will fall back to static models)
      return dynamicModels.length > 0 ? dynamicModels : [];
    } catch (error) {
      logger.error('Failed to get dynamic models for Gemini CLI:', error);
      // Return empty array on error, will fall back to static models
      return [];
    }
  }
}
