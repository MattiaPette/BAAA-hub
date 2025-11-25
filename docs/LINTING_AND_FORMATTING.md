# ESLint and Prettier Configuration

This document explains the ESLint and Prettier configuration setup for the
Activity Tracker monorepo.

## Overview

The project uses a centralized configuration approach where ESLint and Prettier
configurations are defined at the root level and shared across all packages.
This ensures consistency and reduces maintenance overhead.

## Configuration Files

### Root Level

- **`.prettierrc.json`** - Prettier configuration applied to all packages
- **`.prettierignore`** - Files and directories to exclude from formatting
- **`eslint.config.base.js`** - Base ESLint configuration with common rules
- **`.lintstagedrc.json`** - Configuration for pre-commit hooks
- **`.gitattributes`** - Enforces LF line endings for all text files
- **`.editorconfig`** - Editor configuration for consistent formatting across
  IDEs

### Package Level

- **`apps/Client.Web/eslint.config.js`** - Frontend-specific ESLint rules that
  extend the base config

## Prettier Configuration

The root `.prettierrc.json` defines formatting rules for the entire monorepo:

- Arrow functions: Avoid parentheses when possible
- Single quotes for strings
- Trailing commas in all cases
- 2-space indentation
- 80 character line width
- **Unix line endings (LF)** - Enforced via Prettier, `.gitattributes`, and
  `.editorconfig`

### Line Ending Enforcement

The project strictly enforces LF (Unix-style) line endings to prevent issues
with different operating systems:

1. **Prettier** - Configured with `"endOfLine": "lf"` to automatically fix line
   endings
2. **`.gitattributes`** - Git is configured to normalize all text files to LF
3. **`.editorconfig`** - Helps IDEs use the correct line endings automatically

This ensures consistency across all contributors regardless of their operating
system.

## ESLint Configuration

### Base Configuration

The `eslint.config.base.js` provides shared rules for all packages:

- ESLint recommended rules
- Prettier integration to prevent conflicts
- Basic JavaScript/TypeScript rules

### Frontend Configuration

The frontend extends the base config and adds:

- **React** rules (Airbnb style guide)
- **TypeScript** rules
- **Accessibility** rules (jsx-a11y)
- **Functional programming** rules (eslint-plugin-functional)
- **React Hooks** rules

## Available Scripts

### Monorepo-wide

```bash
# Lint all packages
pnpm lint

# Format all files
pnpm format

# Check formatting without making changes
pnpm format:check
```

### Package-specific

```bash
# Lint frontend only
pnpm fe:lint

# Format frontend only
pnpm fe:format
```

## Pre-commit Hooks

The project uses Husky and lint-staged to automatically lint and format files
before committing:

1. When you run `git commit`, Husky triggers lint-staged
2. Lint-staged runs ESLint and Prettier on staged files
3. If any issues are found and fixed, you'll need to stage the changes again
4. If unfixable issues exist, the commit is blocked

## VSCode Integration

The workspace is configured to:

- Auto-format files on save using Prettier
- Show ESLint errors in real-time
- Use the correct formatter for each file type

Make sure you have these VSCode extensions installed:

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)

## Adding New Packages

When adding a new package to the monorepo:

1. Create an `eslint.config.js` that imports and extends the base config
2. The package will automatically use the root Prettier configuration
3. Add any package-specific ESLint rules as needed
4. Update lint-staged configuration if you need custom linting for specific file
   patterns

Example for a new package:

```javascript
// apps/NewPackage/eslint.config.js
import baseConfig from '../../eslint.config.base.js';

export default [
  ...baseConfig,
  {
    // Add package-specific rules here
    rules: {
      // Custom rules
    },
  },
];
```

## Troubleshooting

### ESLint errors in IDE

- Restart VSCode/your IDE
- Run `pnpm install` to ensure all plugins are installed
- Check that the ESLint extension is enabled

### Formatting not working

- Verify Prettier is set as the default formatter in VSCode settings
- Check that `editor.formatOnSave` is enabled
- Run `pnpm format` manually to fix all files

### Pre-commit hook failing

- Review the errors shown in the terminal
- Run `pnpm lint` to see all issues
- Fix issues manually or let ESLint auto-fix when possible
- Stage the fixed files and commit again

## Modernization Choices

This configuration was modernized to:

1. **Use ESLint v9 flat config** - The new configuration format (vs old
   .eslintrc)
2. **Remove outdated plugins** - eslint-plugin-deprecation was removed
   (incompatible with ESLint v9)
3. **Streamline import rules** - Modern build tools handle imports better, so
   many rules were disabled
4. **Centralize configuration** - Reduces duplication and ensures consistency
5. **Simplify maintenance** - Adding new packages is easier with shared configs

## Future Considerations

When adding backend packages:

- The base ESLint config is language-agnostic
- Add backend-specific plugins (e.g., for Node.js) in the package's
  eslint.config.js
- Prettier will work the same for backend code
- Update lint-staged if different tools are needed for backend files
