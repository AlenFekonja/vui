import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        if (!navigator.serviceWorker.controller) {
          navigator.serviceWorker.register('sw.js', { scope: '/' })
            .then(reg => {
              console.log('Service Worker registered with scope:', reg.scope);
            })
            .catch(err => {
              console.error('Service Worker registration failed:', err);
            });
        } else {
          console.log('Service Worker already controlling this page.');
        }
      });
    }

    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('User allowed notifications.');
        }
      });
    }

    document.querySelectorAll('img').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        if (event.key === 'T') {
          window.location.href = '/tasks';
        }
        if (event.key === 'L') {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          window.location.href = '/';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
