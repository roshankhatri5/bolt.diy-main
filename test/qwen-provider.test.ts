import { describe, it, expect, beforeEach, vi } from 'vitest';
import QwenProvider from '~/lib/modules/llm/providers/qwen';
import { createOpenAI } from '@ai-sdk/openai';

// Mock the createOpenAI function
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

// Mock fs promises
vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('QwenProvider', () => {
  let provider: QwenProvider;

  beforeEach(() => {
    provider = new QwenProvider();
    vi.clearAllMocks();
  });

  describe('Provider Configuration', () => {
    it('should have correct name and configuration', () => {
      expect(provider.name).toBe('Qwen');
      expect(provider.getApiKeyLink).toBe('https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key');
      expect(provider.config.apiTokenKey).toBe('QWEN_API_KEY');
      expect(provider.config.baseUrl).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1');
    });

    it('should have static models defined', () => {
      expect(provider.staticModels).toBeDefined();
      expect(provider.staticModels.length).toBeGreaterThan(0);
      
      // Check for specific models
      const modelNames = provider.staticModels.map(m => m.name);
      expect(modelNames).toContain('qwen3-coder-plus');
      expect(modelNames).toContain('qwen3-coder-flash');
      expect(modelNames).toContain('qwen-max');
    });

    it('should have correct model configurations', () => {
      const qwen3CoderPlus = provider.staticModels.find(m => m.name === 'qwen3-coder-plus');
      expect(qwen3CoderPlus).toBeDefined();
      expect(qwen3CoderPlus?.maxTokenAllowed).toBe(1000000); // 1M context
      expect(qwen3CoderPlus?.maxCompletionTokens).toBe(65536);
      expect(qwen3CoderPlus?.provider).toBe('Qwen');
    });
  });

  describe('getModelInstance', () => {
    it('should create model instance with API key', () => {
      const mockOpenAI = vi.fn();
      (createOpenAI as any).mockReturnValue(mockOpenAI);

      const options = {
        model: 'qwen3-coder-plus',
        serverEnv: {} as any,
        apiKeys: { Qwen: 'test-api-key' },
      };

      provider.getModelInstance(options);

      expect(createOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });
      expect(mockOpenAI).toHaveBeenCalledWith('qwen3-coder-plus');
    });

    it('should throw error when no API key and no valid OAuth', () => {
      const options = {
        model: 'qwen3-coder-plus',
        serverEnv: {} as any,
      };

      expect(() => provider.getModelInstance(options)).toThrow(
        'Qwen OAuth credentials not found or expired'
      );
    });

    it('should use cached OAuth credentials if valid', () => {
      // Set up valid cached credentials
      (provider as any).credentials = {
        access_token: 'cached-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600 * 1000, // Valid for 1 hour
      };

      const mockOpenAI = vi.fn();
      (createOpenAI as any).mockReturnValue(mockOpenAI);

      const options = {
        model: 'qwen3-coder-plus',
        serverEnv: {} as any,
      };

      provider.getModelInstance(options);

      expect(createOpenAI).toHaveBeenCalledWith({
        apiKey: 'cached-token',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });
    });
  });

  describe('getDynamicModels', () => {
    it('should fetch dynamic models successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [
            { id: 'qwen-custom-1', object: 'model' },
            { id: 'qwen-custom-2', object: 'model' },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const models = await provider.getDynamicModels(
        { Qwen: 'test-api-key' },
        {},
        {}
      );

      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('qwen-custom-1');
      expect(models[0].provider).toBe('Qwen');
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const models = await provider.getDynamicModels(
        { Qwen: 'test-api-key' },
        {},
        {}
      );

      expect(models).toEqual([]);
    });

    it('should filter out static models from dynamic results', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [
            { id: 'qwen3-coder-plus', object: 'model' }, // Static model
            { id: 'qwen-custom', object: 'model' }, // Dynamic model
          ],
        }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const models = await provider.getDynamicModels(
        { Qwen: 'test-api-key' },
        {},
        {}
      );

      // Should only include the dynamic model
      expect(models).toHaveLength(1);
      expect(models[0].name).toBe('qwen-custom');
    });
  });

  describe('OAuth Path Handling', () => {
    it('should handle custom OAuth path', () => {
      const customPath = '~/custom/path/oauth.json';
      const resolvedPath = (provider as any).getQwenCachedCredentialPath(customPath);
      
      expect(resolvedPath).toContain('custom/path/oauth.json');
      expect(resolvedPath).not.toContain('~');
    });

    it('should use default path when no custom path provided', () => {
      const defaultPath = (provider as any).getQwenCachedCredentialPath();
      
      expect(defaultPath).toContain('.qwen');
      expect(defaultPath).toContain('oauth_creds.json');
    });
  });

  describe('Token Validation', () => {
    it('should validate token correctly', () => {
      const validCredentials = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
      };

      expect((provider as any).isTokenValid(validCredentials)).toBe(true);
    });

    it('should invalidate expired token', () => {
      const expiredCredentials = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expiry_date: Date.now() - 1000, // Expired
      };

      expect((provider as any).isTokenValid(expiredCredentials)).toBe(false);
    });

    it('should invalidate token close to expiry', () => {
      const nearExpiryCredentials = {
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expiry_date: Date.now() + 20 * 1000, // 20 seconds (less than 30s buffer)
      };

      expect((provider as any).isTokenValid(nearExpiryCredentials)).toBe(false);
    });
  });
});
