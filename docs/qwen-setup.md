# Qwen Provider Setup Guide

## Overview
The Qwen provider integration allows you to use Alibaba Cloud's Qwen models, including the powerful Qwen3 Coder models with up to 1M context window.

## Available Models
- **Qwen3 Coder Plus** - High-performance coding model with 1M context window
- **Qwen3 Coder Flash** - Fast coding model with 1M context window  
- **Qwen2.5 Coder 32B** - Previous generation 32B parameter model
- **Qwen Coder Plus/Turbo** - Standard coding models with 128k context
- **Qwen Max/Plus/Turbo** - General purpose models

## Authentication Methods

### Method 1: OAuth Authentication (Recommended)

1. **Install Qwen CLI** (if not already installed):
   ```bash
   # Installation instructions vary by platform
   # Visit https://help.aliyun.com/zh/model-studio/ for details
   ```

2. **Authenticate via CLI**:
   ```bash
   qwen auth login
   ```
   This will open a browser window for OAuth authentication.

3. **Verify Authentication**:
   ```bash
   qwen auth status
   ```

4. **Use in Bolt.diy**:
   - The provider will automatically detect credentials from `~/.qwen/oauth_creds.json`
   - No additional configuration needed

### Method 2: Custom OAuth Path

If you have OAuth credentials in a different location:

1. Go to Settings → Cloud Providers → Qwen
2. Enter the custom path in "OAuth Credentials Path"
3. Click "Save Path"

### Method 3: API Key (Alternative)

1. Get your API key from [Alibaba Cloud Console](https://dashscope.console.aliyun.com/)
2. Set the environment variable:
   ```bash
   export QWEN_API_KEY=your_api_key_here
   ```
   Or add it to your `.env` file:
   ```
   QWEN_API_KEY=your_api_key_here
   ```

## Configuration

### Base URL (Optional)
If you need to use a custom endpoint, you can set:
```bash
export QWEN_BASE_URL=https://your-custom-endpoint/v1
```

### OAuth Token Refresh
The provider automatically handles token refresh when:
- Token is within 30 seconds of expiry
- API returns 401 Unauthorized error

## Troubleshooting

### Authentication Issues
- **"No credentials found"**: Run `qwen auth login` first
- **"Token expired"**: The provider should auto-refresh, but you can manually re-authenticate
- **"Failed to refresh token"**: Check internet connection and re-authenticate

### Model Access
- Some models require specific permissions or subscriptions
- Check your Alibaba Cloud account for model availability

### Rate Limits
- Qwen models have rate limits based on your subscription
- Consider using caching for repeated requests

## Example Usage

Once configured, Qwen models will appear in your model selection dropdown. Select any Qwen model and start coding!

```typescript
// The provider handles all authentication and API calls automatically
// Just select a Qwen model and use it like any other provider
```

## Support

For issues specific to:
- **Qwen API**: Contact Alibaba Cloud support
- **Bolt.diy integration**: Open an issue on the GitHub repository
