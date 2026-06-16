import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token');

  if (token) {
    // remove aspas extras no início/fim, se existirem
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};