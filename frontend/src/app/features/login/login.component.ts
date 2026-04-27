import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    const userName = this.username.trim();
    const password = this.password;

    if (!userName || !password) {
      this.showToast('Vui lòng nhập đầy đủ MSSV/Email và Mật khẩu!', 'error');
      return;
    }

    this.loading = true;
    this.authService
      .login({
        userName,
        password,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.showToast(response.message ?? 'Đăng nhập thất bại!', 'error');
            return;
          }

          this.authService.setAuthState(response.data);
          this.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
          
          const redirectUrl = this.authService.getRedirectUrl(response.data.userType);
          window.setTimeout(() => {
            void this.router.navigate([redirectUrl]);
          }, 800);
        },
        error: (error: { error?: { message?: string | null }; message?: string }) => {
          this.showToast(
            error.error?.message ??
              error.message ??
              'Không thể kết nối đến hệ thống đăng nhập!',
            'error'
          );
        },
      });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    window.setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
