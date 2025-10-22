# Form Validation System

## Overview
Centralized, reusable form validation system that eliminates repetitive validation code and provides consistent error messages across the application.

## Features

### ✅ Declarative Configuration
Define validation rules once for each form:

```typescript
const podcastFormConfig: FormConfig = {
  title: {
    label: "Podcast Title",
    rules: { required: true },
  },
  email: {
    label: "Contact email",
    rules: { required: true, type: "email" },
  },
  podcast_name: {
    label: "Podcast URL",
    rules: { required: true, minLength: 3 },
  },
};
```

### ✅ Automatic Error Messages
Error messages are automatically generated from field labels:
- **Required fields:** `"Podcast Title is required"`
- **Email validation:** `"Please enter a valid contact email"`
- **Min length:** `"Podcast URL must be at least 3 characters"`

No more manually writing error messages for each field!

### ✅ Type-Safe Validation
Built-in validation for common field types:
- `email` - Email format validation
- `url` - URL format validation  
- `text` - Plain text (default)

### ✅ Length Constraints
```typescript
rules: { 
  required: true, 
  minLength: 3, 
  maxLength: 100 
}
```

### ✅ Custom Validation
Add your own validation logic:

```typescript
rules: {
  custom: (value) => {
    if (value.includes('badword')) {
      return 'Contains inappropriate content';
    }
    return undefined; // No error
  }
}
```

### ✅ Pattern Matching
Use regex for complex validation:

```typescript
rules: {
  pattern: /^[a-z0-9-]+$/,
}
```

## Usage

### 1. Import the utilities

```typescript
import { validateForm, clearFieldError, type FormConfig } from "@/lib/formValidation";
```

### 2. Define your form configuration

```typescript
const myFormConfig: FormConfig = {
  fieldName: {
    label: "Field Label", // Used in error messages
    rules: { required: true, type: "email" },
  },
  // ... other fields
};
```

### 3. Add error state

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});
```

### 4. Validate on submit

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const validation = validateForm(formData, myFormConfig);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  // Submit form...
};
```

### 5. Clear errors on change

```typescript
<Input
  value={formData.fieldName}
  onChange={(e) => {
    setFormData({ ...formData, fieldName: e.target.value });
    setErrors((prev) => clearFieldError(prev, "fieldName"));
  }}
  error={errors.fieldName}
/>
```

## Benefits

### Before (Manual Validation)
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.title.trim()) {
    newErrors.title = "Please fill out this field";
  }

  if (!formData.email.trim()) {
    newErrors.email = "Please fill out this field";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Please enter a valid email address";
  }

  if (!formData.description.trim()) {
    newErrors.description = "Please fill out this field";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### After (Declarative Validation)
```typescript
const validation = validateForm(formData, podcastFormConfig);

if (!validation.isValid) {
  setErrors(validation.errors);
  return;
}
```

### Results
- **50+ lines** of validation code → **3 lines**
- Consistent error messages across all forms
- Easy to modify validation rules in one place
- Type-safe and reusable

## Error Message Customization

Want different error messages? Just modify the `defaultMessages` in `src/lib/formValidation.ts`:

```typescript
const defaultMessages = {
  required: (label: string) => `${label} is required`,
  email: (label: string) => `Please enter a valid ${label.toLowerCase()}`,
  // ... customize as needed
};
```

All forms will automatically use the new messages!

## API Reference

### `validateForm<T>(formData: T, config: FormConfig)`
Validates entire form against configuration.

**Returns:** `{ isValid: boolean, errors: Record<string, string> }`

### `validateField(value: string | string[], rules: ValidationRule, label: string)`
Validates a single field value.

**Returns:** `string | undefined` (error message or undefined if valid)

### `clearFieldError(errors: Record<string, string>, fieldName: string)`
Removes a specific error from the errors object.

**Returns:** New errors object without the specified field

## Validation Rules

| Rule | Type | Description |
|------|------|-------------|
| `required` | `boolean` | Field must have a value |
| `type` | `'email' \| 'url' \| 'text'` | Built-in type validation |
| `minLength` | `number` | Minimum character length |
| `maxLength` | `number` | Maximum character length |
| `pattern` | `RegExp` | Custom regex pattern |
| `custom` | `(value: string) => string \| undefined` | Custom validation function |

## Migration Guide

To migrate an existing form:

1. **Create form config** with field labels and rules
2. **Replace manual validation** with `validateForm()`  
3. **Update onChange handlers** to use `clearFieldError()`
4. **Remove toast notifications** (if applicable)
5. **Add `noValidate`** to form element to disable browser validation

See `src/components/forms/PodcastFormClient.tsx` for a complete example.
