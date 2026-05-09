import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

      if (error.error && typeof error.error === 'object') {
        // Handle custom backend error response structure
        // Example: { success: false, message: "...", statusCode: 404 }
        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (typeof error.error === 'string' && error.error) {
        errorMessage = error.error;
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
