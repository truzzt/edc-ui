import {EdcUiEnvironment} from './edc-ui-environment';

export const environment: EdcUiEnvironment = {
  production: true,
  keycloakRole: process.env.KEYCLOAK_ROLE as any,
};
