import { APP_INITIALIZER } from '@angular/core';
import UserService from './user-service';

export function keycloakInitializer() {
  return () =>
    UserService.initKeycloak().then((realmAccess) => {
      if (!realmAccess || !realmAccess.roles || !realmAccess.roles.includes('role1')) {
        UserService.doLogout();
        return null;
      } else {
        return realmAccess;
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
