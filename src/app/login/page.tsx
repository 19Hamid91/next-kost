'use client';

import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden px-4 font-sans selection:bg-orange-500/30">
      {/* Aurora Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Core Aurora Shapes */}
        <motion.div 
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-orange-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-zinc-800/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[150px]" 
        />

        {/* Grain & Noise for Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
        
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]" />
      </div>

      {/* Layered Backdrop Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[60px] z-[1] pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
