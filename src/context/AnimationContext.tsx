import { createContext, useContext, useState, ReactNode } from 'react';

interface AnimationContextType {
  showInitialAnimation: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [showInitialAnimation] = useState(() => {
    if (typeof window === 'undefined') return true;
    const hasShown = sessionStorage.getItem('initialAnimationShown') === 'true';
    if (!hasShown) {
      sessionStorage.setItem('initialAnimationShown', 'true');
      return true;
    }
    return false;
  });

  return (
    <AnimationContext.Provider value={{ showInitialAnimation }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}
