import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/geist-mono';
import 'lenis/dist/lenis.css';
import './styles/global.css';
import './styles/sections.css';
import './styles/demo.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
