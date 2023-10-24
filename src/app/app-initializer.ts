import { APP_INITIALIZER } from '@angular/core';
import Keycloak from 'keycloak-js';

export function keycloakInitializer() {
  const keycloakConfig = {
    url: 'https://auth.dev.truzzt.com',
    realm: 'truzzt_id',
    clientId: 'dashboard',
  };

  const keycloak = new Keycloak(keycloakConfig);

  return () =>
    keycloak
      .init({ onLoad: 'login-required' })
      .then((authenticated) => {
        if (authenticated) {
          // Keycloak authentication successful, proceed with the app initialization
        } else {
          // Handle authentication failure
        }
      });
}

export const appInitializerProviders = [
  {
    provide: APP_INITIALIZER,
    useFactory: keycloakInitializer,
    multi: true,
  },
];
