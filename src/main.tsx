import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// fonts are bundled (latin subset only) so the page needs no third-party requests
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
// base styles first so component styles can override them
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
