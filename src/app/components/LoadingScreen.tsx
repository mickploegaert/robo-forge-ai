'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [locked]);
}

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnimatedOut, setHasAnimatedOut] = useState(false);
  useLockBody(isLoading && !hasAnimatedOut);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    setHasAnimatedOut(true);
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {isLoading && (
        <motion.div
          initial={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="relative h-32 w-32 md:h-40 md:w-40"
            style={{ filter: 'brightness(0) invert(1)' }}
          >
            <Image
              src="/robo forge.png"
              alt="RoboForge AI"
              fill
              className="object-contain animate-pulse"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LoadingScreen };
