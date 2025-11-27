# GitHub Copilot Instructions for Activity Tracker

## Pre-PR Quality Checks (MANDATORY)

Before submitting any Pull Request, you **MUST** run the following commands and
address ALL issues that arise:

### 1. Linting

```bash
pnpm fe:lint
```

- This command runs ESLint with auto-fix enabled
- If it reports any errors that cannot be auto-fixed, you must manually fix them
- Re-run until no errors are reported

### 2. Code Formatting

```bash
pnpm fe:format
```

- This command runs Prettier to format all code
- If it makes any changes to files, those changes must be included in your
  commit
- After running, verify with `pnpm fe:format:check` to ensure all files are
  properly formatted

### 3. Type Checking

```bash
pnpm fe:type-check
```

- This runs TypeScript type checking without emitting files
- Any type errors must be fixed before submitting the PR
- Do not use `@ts-ignore` or `any` types to bypass errors unless absolutely
  necessary and well-documented

### 4. Tests with Coverage

```bash
pnpm fe:test --coverage
```

- All tests must pass before submitting a PR
- If you modify existing code, ensure related tests still pass
- If you add new functionality, write appropriate tests
- Do not reduce test coverage
- Address any failing tests by fixing the code or updating tests if the changes
  are intentional

### 5. Internationalization (i18n)

```bash
pnpm fe:extract
# Translate the strings in the .po files
pnpm fe:compile
```

- **All visible user-facing strings MUST be wrapped** in `@lingui` translation
  macros
- Use `t` macro for strings in JavaScript/TypeScript code:
  ```tsx
  import { t } from '@lingui/core/macro';
  const message = t`Hello World`;
  ```
- Use `<Trans>` component for JSX content:
  ```tsx
  import { Trans } from '@lingui/react/macro';
  <Trans>Hello World</Trans>;
  ```
- After adding or modifying visible strings:
  1. Run `pnpm fe:extract` to extract new strings
  2. Translate the strings in the `.po` files (located in
     `apps/Client.Web/src/locales/`)
  3. Run `pnpm fe:compile` to compile translations
- **This process MUST be run on every iteration** when visible strings are added
  or modified
- Check that the Italian translations file (`it/messages.po`) has no empty
  `msgstr` entries for new strings

## Workflow

When working on any issue or feature:

1. **Before making changes:**
   - Run all quality checks to establish baseline
   - Note any pre-existing failures (you are not responsible for fixing
     unrelated issues)

2. **During development:**
   - Make your changes incrementally
   - Run relevant checks frequently (e.g., `pnpm fe:type-check` after TypeScript
     changes)
   - Write or update tests alongside your code changes
   - **Wrap all visible strings in lingui macros** (`t` or `<Trans>`)

3. **Before committing:**
   - Run ALL quality checks listed above (lint, format, type-check, test)
   - **Run translation commands** (`pnpm fe:extract` → translate →
     `pnpm fe:compile`)
   - Fix any issues introduced by your changes
   - Ensure all checks pass (except pre-existing unrelated failures)

4. **Before creating PR:**
   - Run a final check of all commands
   - Verify that any file changes from `pnpm fe:format` are committed
   - Review your changes to ensure they are minimal and focused
   - Ensure commit messages are clear and descriptive

## Quality Standards

- **Code Style:** Follow the project's ESLint and Prettier configurations
- **TypeScript:** Use strong typing, avoid `any` when possible
- **Testing:** Maintain or improve test coverage
- **Documentation:** Update relevant documentation when changing functionality
- **Commits:** Make focused, atomic commits with clear messages

## Common Issues and Solutions

### Issue: Lint errors remain after running `pnpm fe:lint`

- **Solution:** The auto-fix couldn't resolve all issues. Manually review the
  error messages and fix them according to the ESLint rules.

### Issue: Type errors in test files

- **Solution:** Ensure test utilities and mocks are properly typed. Check
  `src/test-utils.tsx` for testing helpers.

### Issue: Tests fail after code changes

- **Solution:** Review the test expectations. If your changes are correct,
  update the tests to reflect the new behavior. If the test is catching a real
  bug, fix your code.

### Issue: Format check fails after running format

- **Solution:** Ensure there are no `.prettierignore` patterns accidentally
  excluding files. Check for syntax errors that might prevent Prettier from
  parsing files.

### Issue: Missing translations after adding new UI strings

- **Solution:** All visible strings must be wrapped in lingui macros:
  1. Use `t\`string\`` for JavaScript/TypeScript strings
  2. Use `<Trans>string</Trans>` for JSX content
  3. Run `pnpm fe:extract` to extract new strings
  4. Add translations to `apps/Client.Web/src/locales/it/messages.po`
  5. Run `pnpm fe:compile` to compile translations
  6. Verify no empty `msgstr ""` entries remain in the `.po` files

## Repository-Specific Information

- **Package Manager:** pnpm v10.20.0
- **Node Version:** 20.x LTS
- **Framework:** React 19.2.0 with TypeScript 5.9.3
- **Test Framework:** Vitest 3.0.1
- **Build Tool:** Vite 7.2.2

## Pre-existing Issues

When you run the quality checks, you may encounter pre-existing failures that
are unrelated to your changes. In such cases:

- Document the pre-existing failures in your PR description
- Only fix issues directly related to your changes
- Do not expand the scope of your PR to fix unrelated issues without discussion

## Automation

The repository has:

- **Husky:** Pre-commit hooks that run linting on staged files
- **lint-staged:** Automatically formats and lints files before commit
- **CI/CD:** GitHub Actions workflows that run these checks on every PR

Your local checks must pass before the CI/CD checks will pass.
