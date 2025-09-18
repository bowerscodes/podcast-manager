import { supabase } from '@/lib/supabase';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import React, { useState } from 'react';
import { FormEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface Props {
  user?: { email?: string }; // Add user prop to get email
}

export default function PasswordForm({ user }: Props) {
  const [formData, setFormData] = useState<PasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof PasswordFormData) => 
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

  const validatePasswords = (): string | null => {
    if (formData.newPassword !== formData.confirmPassword) {
      return "Passwords don't match";
    }
    if (formData.newPassword.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const updatePassword = async (): Promise<void> => {
    const validationError = validatePasswords();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await updatePassword();
  };

  const isFormValid = formData.newPassword && formData.confirmPassword;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <input
        type="email"
        name="username"
        value={user?.email || ''}
        autoComplete="username"
        style={{ display: 'none' }}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="space-y-4">
        <Input
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange('newPassword')}
          autoComplete="new-password"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          autoComplete="new-password"
        />
        <Button 
          color="primary" 
          onPress={updatePassword} 
          isLoading={isLoading}
          isDisabled={!isFormValid}
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}
