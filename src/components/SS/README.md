# SS (Shelved/Saved) Components

This directory contains components that are no longer actively used in the application but have been preserved for potential future use or reference.

## Contents

### Password-Related Components (Deprecated after Magic Link Migration)
- **EmailPasswordForm.tsx** - Email/password authentication form (replaced by MagicLinkForm)
- **PasswordForm.tsx** - Password change form (no longer needed)
- **PasswordInput.tsx** - Password input component with show/hide toggle
- **PasswordStrengthIndicator.tsx** - Visual password strength indicator
- **NewPasswordFields.tsx** - New password fields with confirmation

### Social Authentication Components (Deprecated - Email-Only Flow)
- **SocialLoginButtons.tsx** - Google/GitHub OAuth login buttons (no longer used)

### Unused UI Components (Test-Only)
- **AuthGuard.tsx** - Authentication guard component (not used in app, manual auth checks used instead)
- **ActionCard.tsx** - Clickable action card component (only used in tests)
- **EditableField.tsx** - Inline editable field component (only used in tests)
- **URLPreviewInput.tsx** - URL input with preview (never used)
- **EpisodeDescription.tsx** - Episode description component (only used in tests)

### Debugging Components
- **DebugSession.jsx** - Session debugging component (development only)

## Related Files

Password-related hooks have been moved to `src/hooks/SS/`:
- usePasswordStrength.ts
- usePasswordValidation.ts

Password utilities have been moved to `src/lib/SS/`:
- passwordUtils.ts

OAuth route handlers have been moved to `src/app/auth/SS/`:
- google/ (Google OAuth handler)

## Note

These files are kept for reference and potential future use. They are no longer imported or used in the active codebase.

**Date Archived:** October 10, 2025
**Reason:** Migration to email-only passwordless authentication using magic links (OTP)
