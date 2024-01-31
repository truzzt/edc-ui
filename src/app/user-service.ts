import Keycloak from "keycloak-js";

const _kc = new Keycloak({
    url: 'https://auth.prod.truzzt.eu',
    realm: 'TRUZZT_ID',
    clientId: 'dashboard',
});

const initKeycloak = async () => {
  try {
    const authenticated = await _kc.init({ onLoad: 'login-required' });

    if (authenticated) {
      return _kc.tokenParsed?.realm_access;
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("Error initializing Keycloak", error);
    throw error;
  }
};

const doLogout = _kc.logout;

const UserService = {
  initKeycloak,
  doLogout
};

export default UserService;
