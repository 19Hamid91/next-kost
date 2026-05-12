'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const togglePassword = () => setShowPassword(!showPassword);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Username atau password salah');
      } else {
        toast.success('Login berhasil!');
        router.push('/');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    showPassword,
    togglePassword,
    handleInputChange,
    handleSubmit
  };
}
