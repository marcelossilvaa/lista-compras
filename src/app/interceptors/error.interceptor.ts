import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error.message || 'Ocorreu um erro inesperado.';
        this.toastr.error(errorMsg, 'Erro');
        return throwError(error);
      })
    );
  }
}
