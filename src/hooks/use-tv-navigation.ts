/**
 * TV Navigation Hook
 * Handles keyboard and remote control navigation for TV interfaces
 */

import { useEffect, useState } from 'react';

interface NavigationOptions {
  enableArrowKeys?: boolean;
  enableEnterKey?: boolean;
  enableEscapeKey?: boolean;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
}

export const useTVNavigation = (options: NavigationOptions = {}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    // Detect if running on a TV (by checking user agent or screen size)
    const isLikelyTV = /WebOS|SmartTV|Tizen|NetCast/.test(navigator.userAgent) || 
                      window.screen.width >= 1920;

    if (isLikelyTV) {
      setIsFocusMode(true);
      document.body.classList.add('tv-mode');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          setFocusedIndex(prev => prev + 1);
          break;
        case 'Enter':
        case 'OK': // Some TVs use 'OK' instead of Enter
          e.preventDefault();
          options.onEnter?.();
          break;
        case 'Escape':
        case 'Back':
          e.preventDefault();
          options.onEscape?.();
          break;
      }
    };

    if (options.enableArrowKeys || options.enableEnterKey || options.enableEscapeKey) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [options]);

  return { focusedIndex, isFocusMode, setFocusedIndex };
};

/**
 * TV Focus Management Hook
 * Manages focus states for list items and navigation
 */
export const useTVFocus = (itemCount: number) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : itemCount - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < itemCount - 1 ? prev + 1 : 0));
        break;
      case 'PageUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 10));
        break;
      case 'PageDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(itemCount - 1, prev + 10));
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemCount]);

  return { focusedIndex, setFocusedIndex };
};
