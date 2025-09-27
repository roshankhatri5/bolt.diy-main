import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { GeminiCliOAuth } from '~/lib/modules/llm/gemini-cli-oauth';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action') as string;
  
  const oauth = GeminiCliOAuth.getInstance();

  try {
    switch (action) {
      case 'generate-auth-url': {
        const authUrl = await oauth.generateAuthUrl();
        return json({ success: true, authUrl });
      }

      case 'handle-callback': {
        const code = formData.get('code') as string;
        
        if (!code) {
          return json({ success: false, error: 'No authorization code provided' }, { status: 400 });
        }

        const credentials = await oauth.handleOAuthCallback(code);
        return json({ success: true, credentials });
      }

      case 'check-credentials': {
        const isValid = await oauth.hasValidCredentials();
        return json({ success: true, isValid });
      }

      case 'refresh-tokens': {
        const credentials = await oauth.refreshTokens();
        return json({ success: true, credentials });
      }

      case 'clear-credentials': {
        await oauth.clearCredentials();
        return json({ success: true });
      }

      default:
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Gemini CLI Auth error:', error);
    return json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
