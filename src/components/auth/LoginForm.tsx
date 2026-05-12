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
      <Card className="w-full bg-white border-slate-200 shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden">
        <CardHeader className="text-center space-y-6 pt-10 pb-4">
          <div className="mx-auto w-20 h-20 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-200">
            <Home className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">NextKost</CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Management Dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</Label>
              <Input
                required
                placeholder="Masukkan username"
                className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl focus:bg-white transition-all px-5"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kata Sandi</Label>
              <div className="relative group">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl focus:bg-white transition-all px-5 pr-14"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-200 mt-2 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
