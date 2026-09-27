import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill window.storage if it does not exist
if (typeof window !== 'undefined' && !(window as any).storage) {
  (window as any).storage = {
    get: async (key: string) => {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

