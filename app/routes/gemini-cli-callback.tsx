import { useEffect, useState } from 'react';
import { useSearchParams } from '@remix-run/react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';

export default function GeminiCliCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        // Send the code to our API to exchange for tokens
        const formData = new FormData();
        formData.append('action', 'handle-callback');
        formData.append('code', code);

        const response = await fetch('/api/gemini-cli-auth', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json() as { success: boolean; error?: string };

        if (result.success) {
          setStatus('success');
          setMessage('Authentication successful! You can close this window.');
          
          // Close window after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error(result.error || 'Authentication failed');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-bolt-elements-background flex items-center justify-center p-4">
      <div className="bg-bolt-elements-background-depth-2 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <SiGoogle className="w-16 h-16 text-blue-500" />
          
          <h1 className="text-2xl font-bold text-bolt-elements-textPrimary">
            Gemini CLI Authentication
          </h1>

          <div className="flex items-center gap-3">
            {status === 'processing' && (
              <FaSpinner className="w-6 h-6 animate-spin text-blue-500" />
            )}
            {status === 'success' && (
              <FaCheckCircle className="w-6 h-6 text-green-500" />
            )}
            {status === 'error' && (
              <FaTimesCircle className="w-6 h-6 text-red-500" />
            )}
            <p className={`text-lg ${
              status === 'success' ? 'text-green-500' :
              status === 'error' ? 'text-red-500' :
              'text-bolt-elements-textSecondary'
            }`}>
              {message}
            </p>
          </div>

          {status === 'error' && (
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-md transition-colors"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
