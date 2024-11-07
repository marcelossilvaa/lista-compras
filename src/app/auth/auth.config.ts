import { AuthConfig } from 'angular-oauth2-oidc';
import { isPlatformBrowser } from '@angular/common';

export function getAuthConfig(platformId: Object): AuthConfig {
  const config: AuthConfig = {
    issuer: 'https://accounts.google.com',
    clientId: '652576547197-o8ctsltc1rrighffhb33f7gh1g1543nq.apps.googleusercontent.com', 
    redirectUri: '',
    scope: 'openid profile email',
    responseType: 'code', 
    disableAtHashCheck: true, 
    showDebugInformation: true,
    strictDiscoveryDocumentValidation: false,
  };

  if (isPlatformBrowser(platformId)) {
    config.redirectUri = window.location.origin + '/login-callback';
  }

  return config;
}
