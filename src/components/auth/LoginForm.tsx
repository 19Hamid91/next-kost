'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Home, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginForm } from '@/hooks/useLoginForm';

export default function LoginForm() {
  const {
    formData,
    loading,
    showPassword,
    togglePassword,
    handleInputChange,
    handleSubmit
  } = useLoginForm();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-[420px] z-10"
    >
      <Card className="w-full bg-white/40 backdrop-blur-[40px] border-white/20 shadow-soft rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center space-y-6 pt-12 pb-6">
          <div className="mx-auto w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-500/20 relative">
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-pulse" />
            <Home className="w-10 h-10 text-white relative z-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">NextKost</CardTitle>
            <CardDescription className="text-foreground/50 font-bold uppercase tracking-[0.2em] text-[10px]">Management Dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 ml-1">Username</Label>
              <Input
                required
                placeholder="Masukkan username"
                className="h-14 rounded-2xl px-6 focus:ring-primary/20"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 ml-1">Kata Sandi</Label>
              <div className="relative group">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 rounded-2xl px-6 pr-14 focus:ring-primary/20"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-foreground/50 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white hover:bg-orange-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40 font-bold rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-orange-500/20 mt-4 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
