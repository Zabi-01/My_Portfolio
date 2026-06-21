import { useState, useEffect } from 'react';
import { ArrowUp, ChevronDown } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function ScrollControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      setShowArrow(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-surface-container-high text-primary-fixed border border-outline-variant rounded-full shadow-lg hover:bg-surface-container-highest transition-all duration-300 animate-in fade-in zoom-in"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Scroll Indicator */}
      {showArrow && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-on-surface/50 animate-bounce pointer-events-none">
          <ChevronDown className="w-8 h-8" />
        </div>
      )}
    </>
  );
}
