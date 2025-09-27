# Frequently Asked Questions (FAQ)

<details>
<summary><strong>What are the best models for bolt.diy?</strong></summary>

For the best experience with bolt.diy, we recommend using the following models based on our testing and community feedback:

**🥇 Top Tier Models (Best Results)**
- **Claude 3.5 Sonnet (old)**: Best overall coder, exceptional at understanding context and generating high-quality code
- **GPT-4o**: Strong alternative to Claude 3.5 Sonnet with excellent reasoning capabilities
- **Gemini 2.0 Flash**: Outstanding speed while maintaining excellent code quality and reasoning

**🥈 High Performance Models**
- **DeepSeek Coder V2 and V3**: Best open source models available through OpenRouter, DeepSeek API, or self-hosted
- **Claude 3.5 Haiku**: Faster version of Claude with good performance for simpler tasks
- **GPT-4o Mini**: Cost-effective option from OpenAI with solid coding capabilities

**🥉 Good Performance Models**
- **Qwen 2.5 Coder 32b**: Best model for self-hosting with reasonable hardware requirements (16GB+ VRAM)
- **Codestral**: Mistral's specialized coding model with strong performance
- **Llama 3.1/3.2 70B**: Good open-source option available through multiple providers

**⚠️ Hardware Requirements for Local Models**
- **Minimum**: Models with 7B+ parameters (smaller models lack the capability to properly interact with bolt.diy)
- **Recommended**: 32B+ parameter models for better results
- **Self-hosting**: Ensure adequate VRAM (8GB minimum, 16GB+ recommended)

**💡 Pro Tips**
- Start with Claude 3.5 Sonnet or GPT-4o for the best experience
- Use Gemini 2.0 Flash when you need speed without sacrificing quality
- Try DeepSeek models for cost-effective high-quality coding
- Consider using different models for different tasks (e.g., planning vs. implementation)

</details>

<details>
<summary><strong>How do I get the best results with bolt.diy?</strong></summary>

- **Be specific about your technology stack**:  
  Mention the frameworks, libraries, and tools you want to use (e.g., "Create a Next.js app with TypeScript, Tailwind CSS, and Prisma ORM") in your initial prompt. This ensures bolt.diy scaffolds the project with your preferred technologies and best practices.

- **Use the enhance prompt feature**:  
  Before sending your prompt, click the _enhance_ icon (✨) to let the AI refine and improve your prompt automatically. You can review and edit the enhanced version before submitting for better results.

- **Start with solid foundations, then add features**:  
  Ensure the basic structure and core functionality of your application is working properly before adding advanced features. This helps bolt.diy understand your project architecture and build upon it effectively.

- **Combine related tasks efficiently**:  
  Group simple, related instructions into a single prompt to save time and API costs. For example:  
  _"Update the color scheme to dark mode, add responsive navigation, fix the mobile layout issues, and restart the development server."_

- **Leverage file attachments and context**:
  - Attach images for UI mockups or design references
  - Upload configuration files or documentation for context
  - Include error messages or logs when debugging issues

- **Use project templates wisely**:
  Start with appropriate templates (React, Vue, Next.js, etc.) that match your intended technology stack rather than building from scratch.

- **Take advantage of integrated tools**:
  - Use the built-in terminal for debugging and testing
  - Leverage Git integration for version control
  - Utilize the file locking system when making manual edits
  - Access the search functionality to navigate large codebases
</details>

<details>
<summary><strong>How do I use the new file locking feature?</strong></summary>

The file locking system prevents conflicts when both you and the AI are working on the same files:

- **Automatic Locking**: Files are automatically locked when the AI is modifying them
- **Manual Locking**: Right-click on files/folders in the file tree to manually lock them
- **Lock Indicators**: Locked items show a lock icon (🔒) in the file tree
- **Scope**: Locks are project-specific and don't affect other chats or projects
- **Unlock**: Unlock files when you're ready to allow AI modifications again

This feature is especially useful when you want to manually edit certain files while letting the AI work on others.

</details>

<details>
<summary><strong>Can I deploy my projects to cloud platforms?</strong></summary>

Yes! bolt.diy supports one-click deployment to multiple platforms:

**Supported Platforms:**
- **Vercel**: Connect your account in Settings → Connections → Vercel
- **Netlify**: Connect your account in Settings → Connections → Netlify  
- **GitHub Pages**: Push to GitHub and enable Pages in repository settings
- **Cloudflare Pages**: Direct deployment from the project interface

**Deployment Features:**
- Automatic build configuration for popular frameworks
- Environment variable management
- Custom domain support (through platform settings)
- Deployment previews and rollback capabilities

The deployment process handles framework detection, build optimization, and configuration automatically.

</details>

<details>
<summary><strong>How do I use the Supabase integration?</strong></summary>

bolt.diy includes built-in Supabase support for full-stack applications:

**Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from the Supabase dashboard
3. Configure the connection in Settings → Connections → Supabase
4. Use Supabase tools in your project for database operations

**Features Available:**
- **Database Management**: Create tables, run queries, manage schemas
- **Authentication**: Built-in user management and auth flows
- **Real-time Features**: Live data subscriptions and updates
- **Row Level Security**: Implement fine-grained access controls
- **Storage**: File uploads and management

The AI can help you design database schemas, write SQL queries, and implement authentication flows.

</details>

<details>
<summary><strong>What's the difference between the web app and desktop app?</strong></summary>

Both versions provide the same core functionality, but the desktop app offers additional benefits:

**Desktop App Advantages:**
- **Native File System Access**: Better integration with local files and folders
- **Auto-updater**: Automatic updates without manual downloads
- **System Integration**: File associations, context menus, notifications
- **Multiple Windows**: Open multiple projects simultaneously
- **Offline Capabilities**: Better support for local AI models and cached projects
- **Enhanced Security**: Sandboxed execution with secure credential storage

**Web App Advantages:**
- **Instant Access**: No installation required, works in any modern browser
- **Platform Agnostic**: Works on any operating system with a web browser
- **Always Updated**: Latest features without manual updates
- **Easier Sharing**: Share projects via URLs

Choose based on your workflow preferences and requirements.

</details>

<details>
<summary><strong>How do I contribute to bolt.diy?</strong></summary>

We welcome contributions from the community! Here's how you can get involved:

**Ways to Contribute:**
- **Report Bugs**: Submit issues with detailed reproduction steps
- **Request Features**: Propose new features or improvements
- **Submit Code**: Fix bugs, add features, or improve documentation
- **Join as Core Contributor**: Apply through our [Contributor Application Form](https://forms.gle/TBSteXSDCtBDwr5m7)

**Getting Started:**
1. Check our [Contributing Guide](CONTRIBUTING.md) for detailed instructions
2. Review the [Project Management Guide](PROJECT.md) to understand our workflow
3. Join our community at [thinktank.ottomator.ai](https://thinktank.ottomator.ai)
4. Look for issues labeled "good first issue" to get started

**Development Setup:**
- Fork the repository and create a feature branch
- Follow our coding standards and PR guidelines
- Test your changes thoroughly before submitting
- Focus on one feature or bug fix per PR

</details>

<details>
<summary><strong>What are the future plans for bolt.diy?</strong></summary>

Visit our [Roadmap](https://roadmap.sh/r/ottodev-roadmap-2ovzo) for the latest updates.  
New features and improvements are on the way!

</details>

<details>
<summary><strong>Why are there so many open issues/pull requests?</strong></summary>

bolt.diy began as a small showcase project on @ColeMedin's YouTube channel to explore editing open-source projects with local LLMs. However, it quickly grew into a massive community effort!

We're forming a team of maintainers to manage demand and streamline issue resolution. The maintainers are rockstars, and we're also exploring partnerships to help the project thrive.

</details>

<details>
<summary><strong>How do local LLMs compare to larger models like Claude 3.5 Sonnet for bolt.diy?</strong></summary>

While local LLMs are improving rapidly, larger models like GPT-4o, Claude 3.5 Sonnet, and DeepSeek Coder V2 236b still offer the best results for complex applications. Our ongoing focus is to improve prompts, agents, and the platform to better support smaller local LLMs.

</details>

<details>
<summary><strong>Common Errors and Troubleshooting</strong></summary>

### **"There was an error processing this request"**

This generic error message means something went wrong. Check both:

- The terminal (if you started the app with Docker or `pnpm`).
- The developer console in your browser (press `F12` or right-click > _Inspect_, then go to the _Console_ tab).

### **"x-api-key header missing"**

This error is sometimes resolved by restarting the Docker container.  
If that doesn't work, try switching from Docker to `pnpm` or vice versa. We're actively investigating this issue.

### **Blank preview when running the app**

A blank preview often occurs due to hallucinated bad code or incorrect commands.  
To troubleshoot:

- Check the developer console for errors.
- Remember, previews are core functionality, so the app isn't broken! We're working on making these errors more transparent.

### **"Everything works, but the results are bad"**

Local LLMs like Qwen-2.5-Coder are powerful for small applications but still experimental for larger projects. For better results, consider using larger models like GPT-4o, Claude 3.5 Sonnet, or DeepSeek Coder V2 236b.

### **"Received structured exception #0xc0000005: access violation"**

If you are getting this, you are probably on Windows. The fix is generally to update the [Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170)

### **"Miniflare or Wrangler errors in Windows"**

You will need to make sure you have the latest version of Visual Studio C++ installed (14.40.33816), more information here https://github.com/stackblitz-labs/bolt.diy/issues/19.

</details>

---

Got more questions? Feel free to reach out or open an issue in our GitHub repo!
