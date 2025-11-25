import { createRoot } from 'react-dom/client';

import { App } from './containers/core/App/App.tsx';
import { AuthConfigurationProps } from './containers/core/App/App.model.ts';

const auth: AuthConfigurationProps = {
  domain: import.meta.env.VITE_AUTH_DOMAIN,
  clientID: import.meta.env.VITE_AUTH_CLIENT_ID,
  responseType: 'token id_token',
  userDatabaseConnection: import.meta.env.VITE_AUTH_DATABASE_CONNECTION,
  scope: 'openid profile email',
  redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI,
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
