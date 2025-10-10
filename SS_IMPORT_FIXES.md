# SS Directory Import Path Fixes

## Problem
After moving components to SS (Shelved/Saved) directories, the build failed because SS components were still importing from their original locations, which no longer existed.

## Build Errors Fixed
1. ❌ `Cannot find module '@/components/account/PasswordInput'`
2. ❌ `Cannot find module '@/lib/passwordUtils'`
3. ❌ `Cannot find module './createServiceClient'`
4. ❌ Unused imports: `Textarea`, `FiCheck`, `FiX` in EditableField.tsx

## Files Fixed

### 1. `src/components/SS/NewPasswordFields.tsx`
**Changed imports:**
- `@/components/account/PasswordInput` → `./PasswordInput`
- `@/components/account/PasswordStrengthIndicator` → `./PasswordStrengthIndicator`
- `@/lib/passwordUtils` → `@/lib/SS/passwordUtils`

### 2. `src/components/SS/PasswordForm.tsx`
**Changed imports:**
- `@/components/account/PasswordInput` → `./PasswordInput`
- `@/components/account/PasswordStrengthIndicator` → `./PasswordStrengthIndicator`
- `@/lib/passwordUtils` → `@/lib/SS/passwordUtils`

### 3. `src/components/SS/PasswordStrengthIndicator.tsx`
**Changed imports:**
- `@/hooks/usePasswordStrength` → `@/hooks/SS/usePasswordStrength`

### 4. `src/components/SS/EditableField.tsx`
**Removed unused imports:**
- ❌ `Textarea` from `@heroui/input`
- ❌ `FiCheck`, `FiX` from `react-icons/fi`

### 5. `src/hooks/SS/usePasswordStrength.ts`
**Changed imports:**
- `@/lib/passwordUtils` → `@/lib/SS/passwordUtils`

### 6. `src/hooks/SS/usePasswordValidation.ts`
**Changed imports:**
- `@/lib/passwordUtils` → `@/lib/SS/passwordUtils`

### 7. `src/lib/SS/passwordUtils.ts`
**Changed imports:**
- `./createServiceClient` → `@/lib/createServiceClient` (stays in active codebase)

## Import Pattern Rules for SS Directory

### ✅ DO:
- Use **relative imports** (`./`) for SS components importing other SS components in same directory
- Use **absolute imports** (`@/lib/SS/`, `@/hooks/SS/`) for SS components importing from SS subdirectories
- Use **absolute imports** (`@/lib/supabase`) for importing from active codebase (shared utilities)

### ❌ DON'T:
- Import from original paths like `@/components/account/` or `@/lib/` for moved files
- Leave unused imports (causes ESLint warnings and bloats bundle)

## Verification

✅ **Build Status:** Successful
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (11/11)
```

✅ **Test Status:** All passing
```
Test Suites: 30 passed, 30 total
Tests:       381 passed, 381 total
```

✅ **Bundle Size:** No increase (SS files not included in production bundle)

## Key Takeaway

When archiving code to SS directories, always update internal imports to:
1. Use relative paths for same-directory imports
2. Use `@/*/SS/*` pattern for cross-directory SS imports
3. Keep imports to active codebase as absolute paths
