import { type ActionFunction, json } from '@remix-run/cloudflare';
const QWEN_DIR = '.qwen';
const QWEN_CREDENTIAL_FILENAME = 'oauth_creds.json';
const QWEN_OAUTH_BASE_URL = 'https://chat.qwen.ai';
const QWEN_OAUTH_AUTH_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/authorize`;
const QWEN_OAUTH_CLIENT_ID = 'f0304373b74a44d2b584a3fb70ca9e56';

interface QwenOAuthCredentials {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  resource_url?: string;
}

async function getNodeDeps() {
  if (typeof window !== 'undefined') {
    throw new Error('Qwen OAuth credential management is only available in a Node environment.');
  }

  const [fs, os, path] = await Promise.all([
    import('node:fs/promises'),
    import('node:os'),
    import('node:path'),
  ]);

  return { fs, os, path };
}

async function getQwenCachedCredentialPath(customPath?: string): Promise<string> {
  const { os, path } = await getNodeDeps();

  if (customPath) {
    // Support custom path that starts with ~/ or is absolute
    if (customPath.startsWith('~/')) {
      return path.join(os.homedir(), customPath.slice(2));
    }
    return path.resolve(customPath);
  }
  return path.join(os.homedir(), QWEN_DIR, QWEN_CREDENTIAL_FILENAME);
}

async function checkCredentials(oauthPath?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { fs } = await getNodeDeps();
    const keyFile = await getQwenCachedCredentialPath(oauthPath);
    const credsStr = await fs.readFile(keyFile, 'utf-8');
    const credentials: QwenOAuthCredentials = JSON.parse(credsStr);
    
    // Check if token is valid
    const TOKEN_REFRESH_BUFFER_MS = 30 * 1000; // 30s buffer
    if (credentials.expiry_date && Date.now() < credentials.expiry_date - TOKEN_REFRESH_BUFFER_MS) {
      return { success: true };
    } else {
      return { success: false, error: 'Token expired' };
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { success: false, error: 'No credentials found. Please authenticate first.' };
    }
    return { success: false, error: `Failed to read credentials: ${error.message}` };
  }
}

async function authenticate(oauthPath?: string): Promise<{ success: boolean; authUrl?: string; error?: string }> {
  // For OAuth flow, we would typically generate an authorization URL
  // However, Qwen authentication is typically done via their CLI tool
  // This is a placeholder that returns instructions
  
  return {
    success: false,
    error: 'Please authenticate using the Qwen CLI: qwen auth login',
    authUrl: undefined
  };
  
  // In a real implementation with proper OAuth flow:
  // const authUrl = `${QWEN_OAUTH_AUTH_ENDPOINT}?client_id=${QWEN_OAUTH_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  // return { success: true, authUrl };
}

async function logout(oauthPath?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { fs } = await getNodeDeps();
    const keyFile = await getQwenCachedCredentialPath(oauthPath);
    await fs.unlink(keyFile);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { success: true }; // Already logged out
    }
    return { success: false, error: `Failed to logout: ${error.message}` };
  }
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const oauthPath = formData.get('oauthPath') as string | undefined;

    switch (action) {
      case 'check-credentials':
        return json(await checkCredentials(oauthPath));
      
      case 'authenticate':
        return json(await authenticate(oauthPath));
      
      case 'logout':
        return json(await logout(oauthPath));
      
      default:
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Qwen auth error:', error);
    return json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
};
