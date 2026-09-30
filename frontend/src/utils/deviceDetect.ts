/**
 * Hardware-level device and pointer capability detector.
 * Avoids brittle user-agent scraping by testing real CSS media queries and pointer attributes.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  isCoarsePointer: boolean;
  os: 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      isCoarsePointer: false,
      os: 'unknown',
    };
  }

  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;

  const isMobile = (hasTouch && isCoarsePointer && width < 768) || width < 768;
  const isTablet = hasTouch && width >= 768 && width < 1024;
  const isDesktop = !isMobile && !isTablet;

  const ua = navigator.userAgent.toLowerCase();
  let os: DeviceInfo['os'] = 'unknown';

  if (/iphone|ipad|ipod/.test(ua)) {
    os = 'ios';
  } else if (/android/.test(ua)) {
    os = 'android';
  } else if (/macintosh|mac os x/.test(ua)) {
    os = 'macos';
  } else if (/windows|win32/.test(ua)) {
    os = 'windows';
  } else if (/linux/.test(ua)) {
    os = 'linux';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    isCoarsePointer,
    os,
  };
}

/**
 * Constructs native mobile deep-link URLs to redirect mobile users to compatible wallet applications
 */
export function getMobileWalletDeepLink(targetApp: 'lace' | '1aim' | 'generic'): string {
  const currentUrl = encodeURIComponent(window.location.href);

  switch (targetApp) {
    case 'lace':
      return `https://lace.io/browser?dapp=${currentUrl}`;
    case '1aim':
      return `https://1aim.xyz/dapp?url=${currentUrl}`;
    default:
      return `https://midnight.network/dapps?url=${currentUrl}`;
  }
}

