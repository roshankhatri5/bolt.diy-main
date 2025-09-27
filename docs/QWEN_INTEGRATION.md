# Qwen Provider Integration

## Summary

Successfully integrated Qwen (Alibaba Cloud's AI models) provider into bolt.diy-main with full OAuth and API key authentication support.

## Features Added

### 1. **QwenProvider Class** (`app/lib/modules/llm/providers/qwen.ts`)
- Full OAuth authentication with automatic token refresh
- API key authentication fallback
- Support for custom OAuth credential paths
- Automatic base URL configuration
- Error handling and retry logic

### 2. **Model Support**
- **Qwen3 Coder Plus** - 1M context window, 65k output tokens
- **Qwen3 Coder Flash** - 1M context window, optimized for speed
- **Qwen2.5 Coder 32B** - 32B parameter model
- **Qwen Coder Plus/Turbo** - 128k context models
- **Qwen Max/Plus/Turbo** - General purpose models

### 3. **UI Components**
- **QwenSettings Component** (`app/components/@settings/providers/QwenSettings.tsx`)
  - OAuth status checking
  - Custom credential path configuration
  - Authentication/logout functionality
  - Real-time status updates

### 4. **API Endpoint** (`app/routes/api.qwen-auth.ts`)
- Check credential status
- Handle authentication flow
- Logout functionality

### 5. **Registry Integration**
- Added to provider registry (`app/lib/modules/llm/registry.ts`)
- Integrated with CloudProvidersTab UI
- Added provider icon and description

## Key Implementation Details

### OAuth Authentication Flow
1. Checks for existing credentials in `~/.qwen/oauth_creds.json` or custom path
2. Validates token expiry (30-second buffer before expiry)
3. Automatically refreshes expired tokens
4. Falls back to API key if OAuth not available

### Token Refresh Mechanism
- Implements singleton pattern for refresh requests
- Prevents multiple simultaneous refresh attempts
- Updates credentials file after successful refresh
- Handles 401 errors with automatic retry

### Configuration Options
```typescript
// Environment variables
QWEN_API_KEY=your_api_key
QWEN_BASE_URL=https://custom-endpoint/v1

// Settings
qwenOauthPath: "~/custom/path/oauth.json"
```

## Usage

### Method 1: OAuth (Recommended)
```bash
# Authenticate via Qwen CLI
qwen auth login

# The provider will automatically use credentials from ~/.qwen/oauth_creds.json
```

### Method 2: API Key
```bash
# Set environment variable
export QWEN_API_KEY=your_api_key

# Or add to .env file
QWEN_API_KEY=your_api_key
```

### Method 3: Custom OAuth Path
1. Go to Settings → Cloud Providers → Qwen
2. Enter custom OAuth path
3. Click "Save Path"

## Testing

Created comprehensive test suite (`test/qwen-provider.test.ts`) covering:
- Provider configuration
- Model instance creation
- OAuth credential handling
- Token validation logic
- Dynamic model fetching
- Error handling

## Files Modified/Created

### New Files
- `app/lib/modules/llm/providers/qwen.ts` - Main provider implementation
- `app/components/@settings/providers/QwenSettings.tsx` - Settings UI component
- `app/routes/api.qwen-auth.ts` - Authentication API endpoint
- `test/qwen-provider.test.ts` - Test suite
- `docs/qwen-setup.md` - User documentation
- `docs/QWEN_INTEGRATION.md` - This file

### Modified Files
- `app/lib/modules/llm/registry.ts` - Added QwenProvider export
- `app/types/model.ts` - Added qwenOauthPath to IProviderSetting
- `app/components/@settings/tabs/providers/cloud/CloudProvidersTab.tsx` - Added Qwen to provider list

## Architecture Decisions

1. **OAuth First**: Prioritized OAuth authentication for security and ease of use
2. **Automatic Token Management**: Implemented automatic refresh to minimize user intervention
3. **Graceful Fallback**: API key support for environments where OAuth isn't feasible
4. **Consistent UI**: Followed existing patterns from GeminiCliProvider
5. **Error Recovery**: Comprehensive error handling with user-friendly messages

## Future Enhancements

1. **OAuth Web Flow**: Implement full OAuth authorization flow without CLI dependency
2. **Model Filtering**: Add UI to filter/select specific Qwen models
3. **Usage Tracking**: Add token usage monitoring and alerts
4. **Caching**: Implement response caching for frequently used prompts
5. **Batch Processing**: Support for batch API calls

## Compatibility

- Works with existing bolt.diy-main architecture
- Compatible with all existing providers
- No breaking changes to existing functionality
- Follows established provider patterns
