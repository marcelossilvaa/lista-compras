import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login-callback',
  template: `<p>Processando autenticação...</p>`
})
export class LoginCallbackComponent implements OnInit {

  constructor(
    private oauthService: OAuthService,
    private router: Router,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          this.toastr.success('Autenticação via Google realizada com sucesso!');
          this.router.navigate(['/']);
        } else {
          this.toastr.error('Falha na autenticação via Google.');
          this.router.navigate(['/login']);
        }
      }).catch(error => {
        console.error('Erro durante o login callback:', error);
        this.toastr.error('Erro durante o processo de autenticação.');
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
