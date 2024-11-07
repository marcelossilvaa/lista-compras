import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutesModule } from './app.routes';
import { OAuthModule } from 'angular-oauth2-oidc';

export const appConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      AppRoutesModule,
      OAuthModule.forRoot({
        resourceServer: {
          allowedUrls: ['http://localhost:3000'], // Ajuste conforme necessário para sua API
          sendAccessToken: true
        }
      })
    )
  ]
};
