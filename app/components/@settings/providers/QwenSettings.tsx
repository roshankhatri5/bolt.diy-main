import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { toast } from 'react-toastify';
import { Info, CheckCircle, XCircle, FileKey, Loader2 } from 'lucide-react';

interface QwenSettingsProps {
  settings: {
    qwenOauthPath?: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export const QwenSettings: React.FC<QwenSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [oauthPath, setOauthPath] = useState(settings.qwenOauthPath || '');
  const [authError, setAuthError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [settings.qwenOauthPath]);

  const checkAuthStatus = async () => {
    setCheckingAuth(true);
    setAuthError(null);
    try {
      const formData = new FormData();
      formData.append('action', 'check-credentials');
      if (settings.qwenOauthPath) {
        formData.append('oauthPath', settings.qwenOauthPath);
      }

      const response = await fetch('/api/qwen-auth', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAuthError(data.error || 'Authentication check failed');
      }
    } catch (error) {
      console.error('Error checking Qwen auth status:', error);
      setIsAuthenticated(false);
      setAuthError('Failed to check authentication status');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleAuthenticate = async () => {
    setAuthError(null);
    try {
      const formData = new FormData();
      formData.append('action', 'authenticate');
      if (oauthPath) {
        formData.append('oauthPath', oauthPath);
      }

      const response = await fetch('/api/qwen-auth', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.authUrl) {
          // Open authentication URL in a new tab
          window.open(data.authUrl, '_blank');
          toast.info('Please complete authentication in the new tab');
        } else {
          toast.success('Qwen authentication successful!');
          setIsAuthenticated(true);
          // Save the OAuth path to settings
          onUpdateSettings({
            ...settings,
            qwenOauthPath: oauthPath || undefined,
          });
        }
      } else {
        toast.error(data.error || 'Authentication failed');
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error authenticating with Qwen:', error);
      toast.error('Failed to authenticate with Qwen');
      setAuthError('Failed to authenticate with Qwen');
    }
  };

  const handleLogout = async () => {
    try {
      const formData = new FormData();
      formData.append('action', 'logout');
      if (settings.qwenOauthPath) {
        formData.append('oauthPath', settings.qwenOauthPath);
      }

      const response = await fetch('/api/qwen-auth', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Logged out from Qwen');
        setIsAuthenticated(false);
        onUpdateSettings({
          ...settings,
          qwenOauthPath: undefined,
        });
      } else {
        toast.error(data.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Error logging out from Qwen:', error);
      toast.error('Failed to logout from Qwen');
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      qwenOauthPath: oauthPath || undefined,
    });
    toast.success('Qwen settings saved');
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold mb-1">Qwen OAuth Authentication</p>
            <p>Qwen uses OAuth for authentication. You can either:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Use the default OAuth credentials location (~/.qwen/oauth_creds.json)</li>
              <li>Specify a custom path to your OAuth credentials file</li>
              <li>Authenticate via Qwen CLI first: <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">qwen auth login</code></li>
            </ol>
            <p className="mt-2">
              Learn more about Qwen authentication at{' '}
              <a 
                href="https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Qwen Documentation
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            OAuth Credentials Path (Optional)
          </label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={oauthPath}
              onChange={(e) => setOauthPath(e.target.value)}
              placeholder="~/.qwen/oauth_creds.json (default)"
              className="flex-1"
              disabled={checkingAuth}
            />
            <Button
              onClick={handleSaveSettings}
              disabled={checkingAuth}
              variant="outline"
            >
              Save Path
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use the default location. Use ~ for home directory.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            {checkingAuth ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : isAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium">
              Status: {checkingAuth ? 'Checking...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          <div className="flex space-x-2">
            {!isAuthenticated ? (
              <Button
                onClick={handleAuthenticate}
                disabled={checkingAuth}
                size="sm"
                variant="default"
              >
                <FileKey className="h-4 w-4 mr-1" />
                Authenticate
              </Button>
            ) : (
              <Button
                onClick={handleLogout}
                disabled={checkingAuth}
                size="sm"
                variant="outline"
              >
                Logout
              </Button>
            )}
            <Button
              onClick={checkAuthStatus}
              disabled={checkingAuth}
              size="sm"
              variant="outline"
            >
              Refresh Status
            </Button>
          </div>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
