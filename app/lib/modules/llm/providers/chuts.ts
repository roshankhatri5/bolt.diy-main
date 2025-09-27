import { BaseProvider, getOpenAILikeModel } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';

const DEFAULT_BASE_URL = 'https://llm.chutes.ai/v1';

export default class ChutsProvider extends BaseProvider {
  name = 'Chuts';

  config = {
    baseUrlKey: 'CHUTS_API_BASE_URL',
    apiTokenKey: 'CHUTS_API_KEY',
    baseUrl: DEFAULT_BASE_URL,
  } as const;

  staticModels: ModelInfo[] = [];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv: Record<string, string> = {},
  ): Promise<ModelInfo[]> {
    const { baseUrl: rawBaseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'CHUTS_API_BASE_URL',
      defaultApiTokenKey: 'CHUTS_API_KEY',
    });

    const baseUrl = this.normalizeBaseUrl(rawBaseUrl) ?? DEFAULT_BASE_URL;

    if (!apiKey) {
      return this.getModelsFromEnvFallback(settings, serverEnv);
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as { data?: any[] };
      const data = Array.isArray(result?.data) ? result.data : [];

      if (data.length === 0) {
        return this.getModelsFromEnvFallback(settings, serverEnv);
      }

      return data
        .filter((model: any) => model?.object === 'model' || model?.id)
        .map((model: any) => ({
          name: model.id,
          label: model.name || model.id,
          provider: this.name,
          maxTokenAllowed: Number(model.context_length) || 8000,
          maxCompletionTokens: Number(model.max_output) || undefined,
        }));
    } catch (error) {
      console.log(`${this.name}: falling back to CHUTS_API_MODELS due to error`, error);
      return this.getModelsFromEnvFallback(settings, serverEnv);
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { baseUrl: rawBaseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'CHUTS_API_BASE_URL',
      defaultApiTokenKey: 'CHUTS_API_KEY',
    });

    const baseUrl = this.normalizeBaseUrl(rawBaseUrl) ?? DEFAULT_BASE_URL;

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return getOpenAILikeModel(baseUrl, apiKey, model);
  }

  private normalizeBaseUrl(baseUrl?: string | null): string | undefined {
    if (!baseUrl) {
      return undefined;
    }

    let sanitized = baseUrl.trim();

    if (sanitized.endsWith('/')) {
      sanitized = sanitized.slice(0, -1);
    }

    sanitized = sanitized.replace(/\/chat\/completions$/i, '');

    return sanitized || undefined;
  }

  private getModelsFromEnvFallback(settings?: IProviderSetting, serverEnv: Record<string, string> = {}): ModelInfo[] {
    // eslint-disable-next-line dot-notation
    const modelsEnv = serverEnv['CHUTS_API_MODELS'] || (settings as any)?.CHUTS_API_MODELS;

    if (!modelsEnv) {
      return [];
    }

    return this.parseModelsFromEnv(modelsEnv);
  }

  private parseModelsFromEnv(modelsEnv: string): ModelInfo[] {
    return modelsEnv
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [modelId, limitStr] = entry.split(':');
        const maxTokenAllowed = limitStr ? parseInt(limitStr.trim(), 10) : 8000;

        const label = modelId
          .split('/')
          .pop()
          ?.replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          name: modelId.trim(),
          label: label || modelId.trim(),
          provider: this.name,
          maxTokenAllowed: Number.isNaN(maxTokenAllowed) ? 8000 : maxTokenAllowed,
        } as ModelInfo;
      });
  }
}
