import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('GeminiCLI-OAuth');

// OAuth2 Configuration
const OAUTH_REDIRECT_URI = 'http://localhost:45289';
const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
];

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

/**
 * Manages OAuth authentication for Gemini CLI
 */
export class GeminiCliOAuth {
  private static instance: GeminiCliOAuth | null = null;
  private authClient: OAuth2Client | null = null;
  private oauthClientId: string | null = null;
  private oauthClientSecret: string | null = null;

  private constructor() {}

  static getInstance(): GeminiCliOAuth {
    if (!GeminiCliOAuth.instance) {
      GeminiCliOAuth.instance = new GeminiCliOAuth();
    }
    return GeminiCliOAuth.instance;
  }

  /**
   * Fetch OAuth configuration from remote server
   */
  private async fetchOAuthConfig(): Promise<void> {
    try {
      const response = await axios.get<{ geminiCli: OauthConfig }>(
        'https://api.kilocode.ai/extension-config.json',
      );
      const config = response.data;

      this.oauthClientId = config.geminiCli.oauthClientId;
      this.oauthClientSecret = config.geminiCli.oauthClientSecret;

      this.authClient = new OAuth2Client(
        this.oauthClientId,
        this.oauthClientSecret,
        OAUTH_REDIRECT_URI
      );
      
      logger.info('OAuth config fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch OAuth config:', error);
      throw new Error('Unable to fetch OAuth configuration');
    }
  }

  /**
   * Generate OAuth URL for user authentication
   */
  async generateAuthUrl(): Promise<string> {
    if (!this.authClient) {
      await this.fetchOAuthConfig();
    }

    if (!this.authClient) {
      throw new Error('OAuth client not initialized');
    }

    const authUrl = this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_SCOPES,
      prompt: 'consent',
    });

    logger.info('Generated OAuth URL');
    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(code: string): Promise<OAuthCredentials> {
    if (!this.authClient) {
      await this.fetchOAuthConfig();
    }

    if (!this.authClient) {
      throw new Error('OAuth client not initialized');
    }

    try {
      const { tokens } = await this.authClient.getToken(code);
      
      const credentials: OAuthCredentials = {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
      };

      // Save credentials to localStorage (browser environment)
      if (typeof window !== 'undefined') {
        localStorage.setItem('gemini-cli-credentials', JSON.stringify(credentials));
      }
      
      logger.info('OAuth credentials saved successfully');
      return credentials;
    } catch (error) {
      logger.error('Failed to exchange OAuth code:', error);
      throw new Error('Failed to complete OAuth authentication');
    }
  }

  /**
   * Check if credentials exist and are valid
   */
  async hasValidCredentials(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      const credData = localStorage.getItem('gemini-cli-credentials');
      if (!credData) {
        return false;
      }
      
      const credentials: OAuthCredentials = JSON.parse(credData);
      
      // Check if credentials exist and are not expired
      return !!(
        credentials.access_token &&
        credentials.refresh_token &&
        credentials.expiry_date > Date.now()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh expired tokens
   */
  async refreshTokens(): Promise<OAuthCredentials> {
    if (!this.authClient) {
      await this.fetchOAuthConfig();
    }

    if (!this.authClient) {
      throw new Error('OAuth client not initialized');
    }

    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot refresh tokens in non-browser environment');
      }
      
      const credData = localStorage.getItem('gemini-cli-credentials');
      if (!credData) {
        throw new Error('No credentials found');
      }
      
      const oldCredentials: OAuthCredentials = JSON.parse(credData);

      this.authClient.setCredentials({
        refresh_token: oldCredentials.refresh_token,
      });

      const { credentials } = await this.authClient.refreshAccessToken();
      
      const newCredentials: OAuthCredentials = {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token || oldCredentials.refresh_token,
        token_type: credentials.token_type || 'Bearer',
        expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
      };

      localStorage.setItem('gemini-cli-credentials', JSON.stringify(newCredentials));
      
      logger.info('OAuth tokens refreshed successfully');
      return newCredentials;
    } catch (error) {
      logger.error('Failed to refresh OAuth tokens:', error);
      throw new Error('Failed to refresh OAuth tokens');
    }
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gemini-cli-credentials');
        logger.info('OAuth credentials cleared');
      }
    } catch (error) {
      // Credentials might not exist
      logger.warn('No credentials to clear');
    }
  }
}
