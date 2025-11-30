import { createRoot } from 'react-dom/client';

import { App } from './containers/core/App/App.tsx';
import { AuthConfigurationProps } from './containers/core/App/App.model.ts';

const auth: AuthConfigurationProps = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <App authConfiguration={auth} />,
);
