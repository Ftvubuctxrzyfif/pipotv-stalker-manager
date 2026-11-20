/**
 * LG WebOS TV Detection Hook
 * Detects if the app is running on an LG WebOS TV
 */

import { useState, useEffect } from 'react';

export const useWebOSDetection = () => {
  const [isWebOS, setIsWebOS] = useState(false);
  const [webOSVersion, setWebOSVersion] = useState<string | null>(null);
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    // Check for WebOS user agent
    const userAgent = navigator.userAgent;
    const isWebOSBrowser = /WebOS|Web0S|SmartTV|NetCast/i.test(userAgent);
    
    // Check for WebOS version
    const versionMatch = userAgent.match(/WebOS\/?([0-9.]+)/i);
    const version = versionMatch ? versionMatch[1] : null;

    // Check for large screen (TV mode)
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const isLargeScreen = screenWidth >= 1920 || screenHeight >= 1080;

    // Check for touch capability (TVs don't have touch)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Combined detection
    const detectedWebOS = isWebOSBrowser || (isLargeScreen && !isTouch);
    
    setIsWebOS(detectedWebOS);
    setWebOSVersion(version);
    setIsTVMode(isLargeScreen);

    // Add WebOS class to body for CSS targeting
    if (detectedWebOS) {
      document.body.classList.add('webos-tv');
      document.body.classList.add('tv-mode');
    }

    // Log detection info for debugging
    console.log('WebOS Detection:', {
      isWebOS: detectedWebOS,
      version,
      isLargeScreen,
      screenWidth,
      screenHeight,
      isTouch,
      userAgent
    });
  }, []);

  return { 
    isWebOS, 
    webOSVersion, 
    isTVMode,
    // WebOS-specific features
    supportsHLS: true, // WebOS browsers support HLS
    supportsRemoteControl: isWebOS || isTVMode,
    needsTVOptimization: isWebOS || isTVMode
  };
};

/**
 * WebOS Remote Control Handler
 * Handles WebOS-specific remote control events
 */
export const useWebOSRemoteControl = () => {
  useEffect(() => {
    const handleWebOSEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('WebOS Event:', customEvent.detail);
      
      // Handle WebOS-specific events
      switch (customEvent.type) {
        case 'webOSBack':
          // Handle back button
          window.history.back();
          break;
        case 'webOSExit':
          // Handle exit button
          console.log('Exit requested');
          break;
      }
    };

    // Add WebOS event listeners (if available)
    if (typeof (window as any).webOS !== 'undefined') {
      window.addEventListener('webOSBack', handleWebOSEvent);
      window.addEventListener('webOSExit', handleWebOSEvent);
    }

    return () => {
      if (typeof (window as any).webOS !== 'undefined') {
        window.removeEventListener('webOSBack', handleWebOSEvent);
        window.removeEventListener('webOSExit', handleWebOSEvent);
      }
    };
  }, []);

  return {
    // WebOS platform API (if available)
    webOS: (window as any).webOS || null,
    // WebOS keyboard API (if available)
    webOSKeyboard: (window as any).webOSKeyboard || null,
  };
};

/**
 * WebOS Screen Control
 * Controls WebOS TV screen behavior
 */
export const useWebOSScreen = () => {
  const preventScreenSaver = () => {
    // Keep screen awake on WebOS
    if (typeof (window as any).webOS !== 'undefined') {
      try {
        (window as any).webOS.deviceinfo.keepAlive(true);
      } catch (error) {
        console.error('Failed to keep screen alive:', error);
      }
    }
  };

  const allowScreenSaver = () => {
    if (typeof (window as any).webOS !== 'undefined') {
      try {
        (window as any).webOS.deviceinfo.keepAlive(false);
      } catch (error) {
        console.error('Failed to allow screen saver:', error);
      }
    }
  };

  return {
    preventScreenSaver,
    allowScreenSaver,
  };
};
