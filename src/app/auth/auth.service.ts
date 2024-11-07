import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { getAuthConfig } from './auth.config';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthFormService } from './auth-form.service';
import { ShoppingListService, User } from '../services/shopping-list.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isOAuthLoggedIn = new BehaviorSubject<boolean>(false);
  public isOAuthLoggedIn$ = this.isOAuthLoggedIn.asObservable();

  private isFormLoggedIn = new BehaviorSubject<boolean>(false);
  public isFormLoggedIn$ = this.isFormLoggedIn.asObservable();

  private loggedIn = new BehaviorSubject<boolean>(false);
  public loggedIn$ = this.loggedIn.asObservable();

  private userIdSubject = new BehaviorSubject<number | null>(null);
  public userId$ = this.userIdSubject.asObservable();

  constructor(
    private oauthService: OAuthService,
    private authFormService: AuthFormService,
    private shoppingListService: ShoppingListService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastr: ToastrService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.configureOAuth();
    }
  }

  private configureOAuth() {
    const config = getAuthConfig(this.platformId);
    this.oauthService.configure(config);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.isOAuthLoggedIn.next(true);
        this.loggedIn.next(true);
        const claims: any = this.oauthService.getIdentityClaims();
        if (claims) {
          const email = claims.email;
          this.mapUserEmailToId(email);
        }
      }
    });

    this.oauthService.events.subscribe((e: OAuthEvent) => {
      if (e.type === 'token_received') {
        this.isOAuthLoggedIn.next(true);
        this.loggedIn.next(true);
        const claims: any = this.oauthService.getIdentityClaims();
        if (claims) {
          const email = claims.email;
          this.mapUserEmailToId(email);
        }
      }
      if (e.type === 'logout') {
        this.isOAuthLoggedIn.next(false);
        this.loggedIn.next(false);
        this.userIdSubject.next(null);
      }
    });
  }

  /**
   * @param email 
   */
  private mapUserEmailToId(email: string | null): void {
    if (email && isPlatformBrowser(this.platformId)) {
      this.shoppingListService.getUserByEmail(email).subscribe(
        (user: User | undefined) => {
          if (user) {
            this.userIdSubject.next(user.id!);
            console.log('Usuário mapeado:', user);
          } else {
            console.warn('Usuário não encontrado. Criando novo usuário.');
            const claims: any = this.oauthService.getIdentityClaims();
            const name = claims ? claims.name : 'Usuário';
            this.shoppingListService.createUser(name, email).subscribe(
              (newUser: User) => {
                this.userIdSubject.next(newUser.id!);
                console.log('Novo usuário criado:', newUser);
              },
              (error) => {
                console.error('Erro ao criar novo usuário:', error);
                this.toastr.error('Erro ao criar novo usuário.');
              }
            );
          }
        },
        (error) => {
          console.error('Erro ao buscar usuário:', error);
          this.toastr.error('Erro ao buscar usuário.');
        }
      );
    }
  }

  public loginWithGoogle() {
    if (isPlatformBrowser(this.platformId)) {
      this.oauthService.initCodeFlow();
    }
  }

  public loginWithForm(username: string, password: string): void {
    this.authFormService.login(username, password).subscribe(success => {
        if (success) {
            this.isFormLoggedIn.next(true);
            const email = this.authFormService.getUserEmail();
            this.mapUserEmailToId(email);
            this.loggedIn.next(true);
            console.log('Login realizado com sucesso!');
            this.router.navigate(['/shopping-list']);
        } else {
            this.toastr.error('Credenciais inválidas. Por favor, tente novamente.');
        }
    }, error => {
        this.toastr.error('Erro durante o login. Tente novamente.');
    });
  }

  public logout() {
    if (this.authFormService.isAuthenticated()) {
      this.authFormService.logout();
      this.isFormLoggedIn.next(false);
      this.loggedIn.next(false);
      this.userIdSubject.next(null);
      this.toastr.info('Logout realizado com sucesso.');
      this.router.navigate(['/login']);
    } else if (this.oauthService.hasValidAccessToken()) {
      if (isPlatformBrowser(this.platformId)) {
        console.log('Logout iniciado via OAuth');
        this.oauthService.logOut();
      }
      this.isOAuthLoggedIn.next(false);
      this.loggedIn.next(false);
      this.userIdSubject.next(null);
      this.toastr.info('Logout realizado com sucesso.');
      this.router.navigate(['/login']);
    } else {
      this.loggedIn.next(false);
      this.userIdSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  public get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  public get userName(): string | null {
    if (this.authFormService.isAuthenticated()) {
      return this.authFormService.getUserName();
    }
    if (isPlatformBrowser(this.platformId)) {
      const claims = this.oauthService.getIdentityClaims();
      if (claims) {
        return claims['name'];
      }
    }
    return null;
  }

  public get userId(): number | null {
    return this.userIdSubject.value;
  }

  public getUserIdObservable(): Observable<number | null> {
    return this.userId$;
  }

  public getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId) && this.oauthService.hasValidAccessToken()) {
      return this.oauthService.getAccessToken();
    }
    return null;
  }
}
