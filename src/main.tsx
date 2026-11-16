import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'thira-sans';
import 'thira-ui/styles.css';
import { App } from './App';
import './app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
