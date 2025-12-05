# Missing Client.Web Unit Tests - Coverage Tracking

This document tracks components and containers in Client.Web that currently lack
test coverage or have skipped tests. The goal is to reach higher test coverage
beyond the current 50%.

> **Note:** This document was generated as part of PR #83. An issue should be
> created to track progress on these items.

## Current Coverage Status

**Overall Coverage (as of PR #83):**

- Line Coverage: 50.02%
- Branch Coverage: 87.98%
- Statement Coverage: 76.92%
- Total Tests: 148 passing, 16 skipped (164 total)

## Components with Skipped Tests

### 1. Dialog Component (9 tests skipped)

**Reason:** Existing bug in theme configuration - `theme.palette.accent.main` is
undefined

**File:** `apps/Client.Web/src/components/commons/feedbacks/Dialog/Dialog.tsx`

**Coverage:** 4.16% lines (17-95 uncovered)

**Blocking Issue:** The component uses `theme.palette.accent.main` on line 81,
but the accent color is not defined in the theme configuration files.

**Action Required:**

- [ ] Fix theme configuration to add `accent` color to palette
- [ ] Un-skip Dialog tests once theme bug is fixed
- [ ] Verify all 9 Dialog tests pass

---

### 2. BaseContainer Component (5 tests skipped)

**Reason:** Requires AuthProvider mocking infrastructure

**File:** `apps/Client.Web/src/containers/BaseContainer/BaseContainer.tsx`

**Coverage:** 18.03% lines (30-94 uncovered)

**Blocking Issue:** The Sidebar component used within BaseContainer requires
`useAuth` hook from AuthProvider. Testing requires mocking Keycloak
authentication.

**Action Required:**

- [ ] Create Keycloak mock infrastructure for testing
- [ ] Set up AuthProvider test wrapper/mock
- [ ] Un-skip BaseContainer tests
- [ ] Verify all 5 tests pass

---

### 3. LoginForm Component (1 test skipped)

**Reason:** Test assertion needs adjustment

**File:** `apps/Client.Web/src/components/login/LoginForm/LoginForm.test.tsx`

**Test:** "should show error state on username and password fields when error
messages are present"

---

### 4. Loader Component (1 test skipped)

**Reason:** Fade animation DOM query issue

**File:**
`apps/Client.Web/src/components/commons/feedbacks/Loader/Loader.test.tsx`

**Test:** "should apply fade animation"

---

## Components with 0% or Low Coverage

### Navigation Components

1. **LinkRouter** - 0% coverage
2. **Sidebar** - 11.64% coverage (Auth required)
3. **SidebarItem** - 30.43% coverage
4. **UserInformations** - 8.33% coverage (Auth required)
5. **UserPopover** - 11.42% coverage (Auth required)
6. **TopBar** - 0% coverage

### Error Handling Components

1. **ErrorBoundary** - 0% coverage
2. **RetryErrorFallback** - 0% coverage

### Utility Components

1. **VisuallyHiddenInput** - 0% coverage
2. **SnackbarCloseAction** - 0% coverage
3. **Card** - 0% coverage
4. **FlexContainer** - 26.92% coverage

### Scripts/PWA Components

1. **InstallApp** - 7.89% coverage

---

## Containers with 0% Coverage

### Authentication Containers (All require AuthProvider)

1. **Login** - 0% coverage
2. **LoginCallback** - 0% coverage
3. **Logout** - 0% coverage
4. **CommissioningToolLogout** - 0% coverage

### Core Containers

1. **App** - 0% coverage
2. **Router** - 0% coverage
3. **MainContainer** - 0% coverage

---

## Priority Action Items

### High Priority (Blocking Tests)

1. **Fix theme.palette.accent bug** - Unblocks 9 Dialog tests
2. **Create Auth mocking infrastructure** - Unblocks ~50+ potential tests
3. **Fix skipped individual tests** - Quick wins (LoginForm, Loader)

### Medium Priority (Components)

1. Add tests for navigation components
2. Add tests for error handling components
3. Add tests for layout components

### Low Priority (Containers)

1. Add tests for authentication flow containers
2. Add tests for core App and Router components
3. Add tests for MainContainer

---

## Success Criteria

- [ ] All 16 skipped tests are un-skipped and passing
- [ ] Test coverage increases from 50% to at least 70% line coverage
- [ ] All components in `src/components` have at least basic rendering tests
- [ ] Critical authentication flows have test coverage
- [ ] No new bugs are introduced during test expansion

---

## Notes

- Some components may legitimately have lower coverage if they're primarily UI
  with minimal logic
- Focus on testing business logic and user interactions over implementation
  details
- Consider adding integration tests for critical user flows once unit test
  coverage is sufficient
- Use the existing test utilities (`src/test-utils.tsx`) for consistent provider
  wrapping

---

## How to Create the Tracking Issue

To create a GitHub issue for tracking this work:

```bash
gh issue create \
  --title "[TRACKING] Missing Client.Web Unit Tests - Path to 70% Coverage" \
  --body "$(cat docs/MISSING_TESTS.md)" \
  --label "enhancement,help wanted" \
  --repo MattiaPette/BAAA-hub
```

Or manually create an issue using the content from this document.
