# Contributing to bolt.diy

Welcome! This guide provides everything you need to contribute effectively to **bolt.diy**, the leading open-source AI-powered development environment. Thank you for helping us build the future of AI-assisted coding! 🚀

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Environment Setup](#development-environment-setup)
4. [Architecture Overview](#architecture-overview)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Coding Standards & Best Practices](#coding-standards--best-practices)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation Standards](#documentation-standards)
9. [Deployment & Docker](#deployment--docker)
10. [VS Code Dev Containers](#vs-code-dev-containers)
11. [Getting Help](#getting-help)

---

## 🛡️ Code of Conduct

This project is governed by our **Code of Conduct**. By participating, you agree to uphold this code. Report unacceptable behavior to the project maintainers.

---

## 🛠️ How Can I Contribute?

### 1️⃣ Reporting Issues & Feature Requests

**Before Creating an Issue:**
- Search existing issues to avoid duplicates
- Check the [FAQ](FAQ.md) for common questions
- Review recent [changelog](changelog.md) for known issues

**Bug Reports Should Include:**
- **Environment details**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected vs actual behavior**
- **Screenshots/videos** when applicable
- **Console errors** from browser dev tools
- **Configuration details**: AI providers, deployment method

**Feature Requests Should Include:**
- **Clear use case**: What problem does this solve?
- **User story**: As a [user type], I want [goal] so that [benefit]
- **Acceptance criteria**: How do we know it's complete?
- **Alternative solutions**: What workarounds exist?

### 2️⃣ Code Contributions

**Contribution Types:**
- 🐛 **Bug fixes**: Resolve reported issues
- ✨ **New features**: Implement planned functionality  
- 📚 **Documentation**: Improve guides, examples, API docs
- 🎨 **UI/UX improvements**: Enhance user experience
- ⚡ **Performance optimizations**: Speed and efficiency improvements
- 🧪 **Testing**: Add test coverage and improve reliability
- 🏗️ **Infrastructure**: Build, deployment, and tooling improvements

**Getting Started:**
1. **Fork the repository** and create a feature branch
2. **Review the project board** for prioritized issues
3. **Comment on issues** you'd like to work on to avoid conflicts
4. **Join our Discord/Community** for real-time collaboration

### 3️⃣ Becoming a Core Contributor

Ready to take on more responsibility? We're looking for dedicated contributors!

**Core Contributor Benefits:**
- ✅ Direct repository access and merge permissions
- 🎯 Influence on project roadmap and technical decisions
- 🏷️ Recognition as a maintainer in the community
- 📋 Participation in planning and architecture discussions

**Apply Here:** [Contributor Application Form](https://forms.gle/TBSteXSDCtBDwr5m7)

**What We Look For:**
- Consistent contribution history to open source projects
- Understanding of modern web development and AI technologies
- Strong communication skills and collaborative mindset
- Experience with TypeScript, React, and Node.js ecosystem

---

## 🖥️ Development Environment Setup

### Prerequisites

**Required Software:**
- **Node.js 18.18.0+**: [Download from nodejs.org](https://nodejs.org/)
- **pnpm 9.14.4+**: Install via `npm install -g pnpm`
- **Git**: [Download from git-scm.com](https://git-scm.com/)

**Recommended Tools:**
- **VS Code**: With recommended extensions (see `.vscode/extensions.json`)
- **Google Chrome Canary**: For local development and testing
- **Docker Desktop**: For containerized development (optional)

### Initial Setup

1. **Clone and Navigate:**
   ```bash
   git clone https://github.com/stackblitz-labs/bolt.diy.git
   cd bolt.diy
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Configuration:**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your API keys
   echo "OPENAI_API_KEY=your_openai_key_here" >> .env.local
   echo "ANTHROPIC_API_KEY=your_anthropic_key_here" >> .env.local
   # Add other provider keys as needed
   ```

4. **Start Development Server:**
   ```bash
   pnpm run dev
   ```

5. **Verify Setup:**
   - Open [http://localhost:5173](http://localhost:5173)
   - Create a test project
   - Verify AI providers are working

### Environment Variables Reference

**Core Configuration:**
```bash
# Required: At least one AI provider API key
OPENAI_API_KEY=sk-...                    # OpenAI models
ANTHROPIC_API_KEY=sk-ant-...            # Claude models
GOOGLE_GENERATIVE_AI_API_KEY=...        # Gemini models

# Optional: Development settings
VITE_LOG_LEVEL=debug                     # Enable debug logging
DEFAULT_NUM_CTX=32768                    # Context window size
NODE_ENV=development                     # Environment mode

# Optional: Local AI providers
OLLAMA_BASE_URL=http://127.0.0.1:11434  # Ollama endpoint
LMSTUDIO_BASE_URL=http://127.0.0.1:1234 # LM Studio endpoint
```

**Security Notes:**
- ⚠️ Never commit `.env.local` or `.env` files
- 🔐 Use different API keys for development and production
- 🛡️ Restrict API key permissions to minimum required scopes

---

## 🏗️ Architecture Overview

Understanding bolt.diy's architecture will help you contribute more effectively:

### Tech Stack
- **Frontend**: Remix + React 18 + TypeScript
- **Build System**: Vite with optimized bundling
- **Styling**: UnoCSS + Tailwind CSS utilities
- **UI Components**: Radix UI primitives
- **State Management**: Zustand + Nanostores
- **Code Editor**: CodeMirror 6 with language support
- **AI Integration**: Vercel AI SDK
- **Development Environment**: WebContainer API
- **Desktop App**: Electron with auto-updater

### Key Directories
```
bolt.diy/
├── app/                          # Main application code
│   ├── components/              # React components
│   │   ├── chat/               # Chat interface
│   │   ├── editor/             # Code editor components
│   │   └── workbench/          # IDE components
│   ├── lib/                    # Core business logic
│   │   ├── modules/            # Feature modules
│   │   └── stores/             # State management
│   ├── routes/                 # Remix routes
│   └── utils/                  # Utility functions
├── docs/                       # Documentation site
├── electron/                   # Desktop app code
├── public/                     # Static assets
└── scripts/                    # Build and deployment scripts
```

### Contributing to Different Areas

**🎨 UI/UX Improvements:**
- Work in `app/components/` for React components
- Modify styles using UnoCSS/Tailwind classes
- Test responsiveness across devices

**🤖 AI Provider Integration:**
- Add new providers in `app/lib/modules/llm/providers/`
- Update the registry in `app/lib/modules/llm/registry.ts`
- Follow the BaseProvider interface

**🛠️ Core Features:**
- Implement business logic in `app/lib/modules/`
- Add new routes in `app/routes/`
- Update stores for state management

**📱 Desktop App:**
- Modify Electron code in `electron/`
- Update build configurations in `electron-builder.yml`

---

## ✅ Pull Request Guidelines

### PR Checklist

Before submitting your pull request, ensure:

- [ ] **Branched from main**: Create feature branches from the latest `main`
- [ ] **Focused scope**: One feature or bug fix per PR
- [ ] **Clear description**: Explain what changes and why
- [ ] **Manual testing**: Test all affected functionality
- [ ] **Documentation updated**: Update relevant docs if needed
- [ ] **No breaking changes**: Or clearly marked if unavoidable
- [ ] **Clean commit history**: Squash commits if necessary

### PR Description Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Manual testing completed
- [ ] Edge cases considered
- [ ] Cross-browser testing (if UI changes)

## Screenshots/Videos
Add visual proof of functionality if applicable.

## Related Issues
Fixes #123, Related to #456
```

### Review Process

1. **Automated Checks**: Ensure all CI checks pass
2. **Manual Testing**: Reviewers test functionality
3. **Code Review**: At least one maintainer review required
4. **Address Feedback**: Respond to review comments promptly
5. **Final Approval**: Maintainer approval for merge

### Best Practices

- **Keep PRs small**: Easier to review and less likely to conflict
- **Write clear commit messages**: Use conventional commit format
- **Test thoroughly**: Include edge cases and error scenarios
- **Be responsive**: Address review feedback quickly
- **Document decisions**: Explain complex logic in code comments

---

## 📏 Coding Standards & Best Practices

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, clear naming
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // Implementation
};

// ❌ Avoid: Any types, unclear naming
const fetchData = async (id: any): Promise<any> => {
  // Implementation
};
```

### React Component Standards

```typescript
// ✅ Good: Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### File Organization

- **Components**: Group related components in folders
- **Hooks**: Custom hooks in `app/lib/hooks/`
- **Utils**: Pure functions in `app/utils/`
- **Types**: Shared types in `app/types/`
- **Constants**: Configuration in `app/lib/constants/`

### Naming Conventions

- **Files**: `kebab-case` for files and folders
- **Components**: `PascalCase` for React components
- **Variables**: `camelCase` for variables and functions
- **Constants**: `UPPER_SNAKE_CASE` for constants
- **Types**: `PascalCase` for interfaces and types

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
// test/utils/example.test.ts
import { describe, it, expect } from 'vitest';
import { formatCode } from '~/utils/formatCode';

describe('formatCode', () => {
  it('should format JavaScript code correctly', () => {
    const input = 'const x=1;const y=2;';
    const expected = 'const x = 1;\nconst y = 2;';
    
    expect(formatCode(input, 'javascript')).toBe(expected);
  });

  it('should handle edge cases', () => {
    expect(formatCode('', 'javascript')).toBe('');
    expect(formatCode(null, 'javascript')).toBe('');
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Testing Best Practices

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Test edge cases and error conditions**
- **Keep tests simple and focused**
- **Mock external dependencies**

---

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Formats code using the specified language parser
 * @param code - The source code to format
 * @param language - Programming language identifier
 * @param options - Optional formatting configuration
 * @returns Formatted code string
 * @throws {Error} When language is not supported
 */
export function formatCode(
  code: string,
  language: string,
  options?: FormattingOptions
): string {
  // Implementation
}
```

### README Updates

When adding features, update relevant documentation:
- Feature description in main README
- Setup instructions if needed
- Configuration options
- Usage examples

---

## 🐳 Deployment & Docker

### Development with Docker

```bash
# Build development image
pnpm run dockerbuild

# Run with Docker Compose
docker compose --profile development up

# Run with custom environment
docker run -p 5173:5173 --env-file .env.local bolt-ai:development
```

### Production Docker Build

```bash
# Build production image
pnpm run dockerbuild:prod

# Run production container
docker compose --profile production up
```

### Docker Best Practices

- Use multi-stage builds for optimization
- Minimize layer count and image size
- Use `.dockerignore` to exclude unnecessary files
- Set appropriate health checks
- Use non-root user for security

---

## 🛠️ VS Code Dev Containers

The project includes Dev Container configuration for consistent development environments:

### Using Dev Containers

1. **Install Extensions**:
   - Dev Containers extension for VS Code

2. **Open in Container**:
   - `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
   - Select the development profile

3. **Benefits**:
   - Pre-configured development environment
   - Consistent tooling across team members
   - Isolated from host system

### Container Features

- Node.js and pnpm pre-installed
- VS Code extensions automatically installed
- Git configuration inherited from host
- Port forwarding for development server

---

## 🆘 Getting Help

### Community Resources

- **GitHub Discussions**: Ask questions and share ideas
- **Discord/Community**: [Join our community](https://thinktank.ottomator.ai)
- **Documentation**: Check the [docs site](https://stackblitz-labs.github.io/bolt.diy/)
- **FAQ**: Review [frequently asked questions](FAQ.md)

### Maintainer Contact

- **Issues**: Use GitHub issues for bugs and feature requests
- **Security**: Email security concerns to maintainers
- **Core Contributor Applications**: Use the application form

### Before Asking for Help

1. Search existing issues and discussions
2. Check documentation and FAQ
3. Try the latest version
4. Provide minimal reproduction example
5. Include environment details and error messages

---

## 🎉 Recognition

Contributors are recognized in several ways:

- **Changelog**: All contributors listed in release notes
- **GitHub**: Contribution graph and commit history
- **Community**: Recognition in community channels
- **Maintainer Status**: Opportunity to become a core contributor

Thank you for contributing to bolt.diy! Together, we're building the future of AI-assisted development. 🚀