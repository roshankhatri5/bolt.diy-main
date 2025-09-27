import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';
import { SiGoogle } from 'react-icons/si';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

interface GeminiCliSettingsProps {
  settings: {
    geminiCliOAuthPath?: string;
    geminiCliProjectId?: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export const GeminiCliSettings: React.FC<GeminiCliSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [projectId, setProjectId] = useState(settings.geminiCliProjectId || '');
  const [oauthPath, setOauthPath] = useState(settings.geminiCliOAuthPath || '');

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [settings.geminiCliOAuthPath]);

  const checkAuthStatus = async () => {
    setCheckingAuth(true);
    try {
      const formData = new FormData();
      formData.append('action', 'check-credentials');
      if (settings.geminiCliOAuthPath) {
        formData.append('oauthPath', settings.geminiCliOAuthPath);
      }

      const response = await fetch('/api/gemini-cli-auth', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setIsAuthenticated(result.isValid || false);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      // Step 1: Generate auth URL
      const formData = new FormData();
      formData.append('action', 'generate-auth-url');

      const response = await fetch('/api/gemini-cli-auth', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success || !result.authUrl) {
        throw new Error('Failed to generate authentication URL');
      }

      // Step 2: Open auth URL in new window
      const authWindow = window.open(result.authUrl, 'gemini-cli-auth', 'width=600,height=700');
      
      // Step 3: Listen for callback
      toast.info('Please complete authentication in the new window');

      // Poll for authentication completion (simplified approach)
      // In production, you'd want to use a proper callback mechanism
      const checkInterval = setInterval(async () => {
        if (authWindow?.closed) {
          clearInterval(checkInterval);
          setIsAuthenticating(false);
          
          // Check if authentication was successful
          await checkAuthStatus();
        }
      }, 1000);

    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(`Authentication failed: ${error.message}`);
      setIsAuthenticating(false);
    }
  };

  const handleClearAuth = async () => {
    try {
      const formData = new FormData();
      formData.append('action', 'clear-credentials');
      if (oauthPath) {
        formData.append('oauthPath', oauthPath);
      }

      const response = await fetch('/api/gemini-cli-auth', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(false);
        toast.success('Authentication cleared successfully');
      } else {
        throw new Error(result.error || 'Failed to clear authentication');
      }
    } catch (error: any) {
      console.error('Failed to clear auth:', error);
      toast.error(`Failed to clear authentication: ${error.message}`);
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      geminiCliOAuthPath: oauthPath || undefined,
      geminiCliProjectId: projectId || undefined,
    });
    toast.success('Gemini CLI settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <SiGoogle className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
          Gemini CLI Settings
        </h3>
      </div>

      {/* Authentication Status */}
      <motion.div
        className={classNames(
          'p-4 rounded-lg border',
          isAuthenticated
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor',
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {checkingAuth ? (
              <FaSpinner className="w-5 h-5 animate-spin text-blue-500" />
            ) : isAuthenticated ? (
              <FaCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FaTimesCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-bolt-elements-textPrimary">
                {checkingAuth
                  ? 'Checking authentication...'
                  : isAuthenticated
                  ? 'Authenticated with Google Cloud'
                  : 'Not authenticated'}
              </p>
              <p className="text-sm text-bolt-elements-textSecondary mt-1">
                {isAuthenticated
                  ? 'You can use Gemini CLI models'
                  : 'Click Authenticate to connect your Google Cloud account'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isAuthenticated ? (
              <Button
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className={classNames(
                  'px-4 py-2 rounded-md font-medium transition-colors',
                  'bg-blue-500 hover:bg-blue-600 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isAuthenticating ? (
                  <>
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Authenticate'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleClearAuth}
                className={classNames(
                  'px-4 py-2 rounded-md font-medium transition-colors',
                  'bg-red-500/10 hover:bg-red-500/20 text-red-500',
                  'border border-red-500/30',
                )}
              >
                Clear Authentication
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Configuration Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">
            Google Cloud Project ID (Optional)
          </label>
          <Input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="default"
            className="w-full"
          />
          <p className="text-xs text-bolt-elements-textSecondary mt-1">
            Leave empty to use the default project
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">
            OAuth Credentials Path (Optional)
          </label>
          <Input
            type="text"
            value={oauthPath}
            onChange={(e) => setOauthPath(e.target.value)}
            placeholder="~/.gemini/oauth_creds.json"
            className="w-full"
          />
          <p className="text-xs text-bolt-elements-textSecondary mt-1">
            Custom path for storing OAuth credentials. Leave empty for default location.
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          className={classNames(
            'px-4 py-2 rounded-md font-medium transition-colors',
            'bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover',
            'text-bolt-elements-button-primary-text',
          )}
        >
          Save Settings
        </Button>
      </div>

      {/* Information Section */}
      <div className="mt-6 p-4 bg-bolt-elements-background-depth-2 rounded-lg">
        <h4 className="font-medium text-bolt-elements-textPrimary mb-2">
          About Gemini CLI
        </h4>
        <ul className="text-sm text-bolt-elements-textSecondary space-y-1">
          <li>• Access Google's latest Gemini models including 2.0 Flash and 2.5 Pro</li>
          <li>• Uses OAuth authentication through Google Cloud</li>
          <li>• All models are available at no cost (free tier)</li>
          <li>• Supports thinking/reasoning models for complex tasks</li>
          <li>• Includes experimental models with cutting-edge capabilities</li>
        </ul>
      </div>
    </div>
  );
};
