import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  try {
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() { return originalFetch; },
      set(newFetch) { 
        console.warn('Blocked attempt to override window.fetch');
      }
    });
  } catch (e) {
    console.warn('Could not define window.fetch property:', e);
  }
}

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
