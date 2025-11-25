# pnpm Installation Guide

This guide will help you install and set up pnpm for local development.

## What is pnpm?

pnpm (performant npm) is a fast, disk space-efficient package manager. It uses a
content-addressable filesystem to store packages, which means:

- **Faster installations**: Packages are stored once globally and linked to
  projects
- **Less disk space**: Shared dependencies across projects are only stored once
- **Strict dependency management**: Better isolation and reproducibility
- **Faster CI/CD**: Significantly reduced installation times in CI pipelines

## Installation Methods

### Method 1: Using npm (Recommended)

The simplest way to install pnpm:

```bash
npm install -g pnpm
```

Verify the installation:

```bash
pnpm --version
# Should output: 10.x.x or higher
```

### Method 2: Using Corepack (Node.js 16.13+)

Corepack is included with Node.js and allows you to use pnpm without manual
installation:

```bash
# Enable Corepack
corepack enable

# Verify pnpm is available
pnpm --version
```

### Method 3: Standalone Script

For systems where npm is not available:

**On POSIX systems (Linux, macOS, WSL):**

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**On Windows (PowerShell):**

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

## Updating pnpm

To update pnpm to the latest version:

```bash
pnpm add -g pnpm
```

Or if you're using Corepack:

```bash
corepack prepare pnpm@latest --activate
```

## Project Setup

After installing pnpm, you can set up the project:

```bash
# Clone the repository
git clone https://github.com/MattiaPette/2025_monorepo_pwa_ai.git
cd 2025_monorepo_pwa_ai

# Use the correct Node version (if using nvm or fnm)
nvm use  # or: fnm use

# Install dependencies
pnpm install

# Start development
pnpm fe:dev
```

## Common Commands

Here are the most common commands you'll use:

```bash
# Install dependencies
pnpm install

# Add a new dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Remove a dependency
pnpm remove <package-name>

# Update dependencies
pnpm update

# Run scripts
pnpm fe:dev
pnpm fe:test
pnpm fe:build
```

## pnpm vs npm/yarn Command Comparison

| npm/yarn                        | pnpm                        |
| ------------------------------- | --------------------------- |
| `npm install` / `yarn install`  | `pnpm install`              |
| `npm install pkg` / `yarn add`  | `pnpm add pkg`              |
| `npm uninstall` / `yarn remove` | `pnpm remove`               |
| `npm update` / `yarn upgrade`   | `pnpm update`               |
| `npm run script`                | `pnpm script` or `pnpm run` |
| `yarn workspace pkg cmd`        | `pnpm --filter pkg cmd`     |
| `npm install -g pkg`            | `pnpm add -g pkg`           |

## Workspace Commands

This project uses pnpm workspaces. Here's how to work with them:

```bash
# Run a command in a specific workspace
pnpm --filter frontend dev
pnpm --filter frontend test

# Run a command in all workspaces
pnpm -r build
pnpm -r test

# Add a dependency to a specific workspace
pnpm --filter frontend add react-router-dom

# Add a dev dependency to the root
pnpm add -D -w eslint
```

## Troubleshooting

### pnpm command not found

If you get "pnpm: command not found", try:

1. Restart your terminal
2. Check your PATH includes npm global bin folder:
   ```bash
   npm config get prefix
   ```
3. Reinstall pnpm:
   ```bash
   npm install -g pnpm
   ```

### Permission errors on Linux/macOS

If you get permission errors, don't use sudo. Instead:

1. Configure npm to use a different directory:
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   ```
2. Add to your PATH in `~/.bashrc` or `~/.zshrc`:
   ```bash
   export PATH=~/.npm-global/bin:$PATH
   ```
3. Reload your shell config and reinstall:
   ```bash
   source ~/.bashrc  # or source ~/.zshrc
   npm install -g pnpm
   ```

### Peer dependency warnings

pnpm is stricter about peer dependencies than npm/yarn. If you see warnings:

- They are often harmless (especially for eslint plugins with version
  mismatches)
- If a package doesn't work, you can use the `.npmrc` configuration to adjust
  settings

### Cache issues

If you encounter strange installation issues, try clearing the pnpm cache:

```bash
pnpm store prune
```

## Why We Migrated to pnpm

This project migrated from Yarn to pnpm for several benefits:

1. **Faster CI/CD**: Installation times in GitHub Actions reduced significantly
2. **Disk space efficiency**: Better use of disk space locally and in CI
3. **Strict mode**: Better dependency isolation prevents phantom dependencies
4. **Modern features**: Better monorepo support and workspace filtering
5. **Active development**: pnpm is actively maintained and frequently updated

## Additional Resources

- [pnpm Documentation](https://pnpm.io/)
- [pnpm CLI Reference](https://pnpm.io/cli/install)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Why pnpm?](https://pnpm.io/motivation)

## Getting Help

If you encounter issues with pnpm:

1. Check the [pnpm troubleshooting guide](https://pnpm.io/faq)
2. Search existing issues in the project repository
3. Create a new issue with the "question" template
