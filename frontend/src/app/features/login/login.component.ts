import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private readonly router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.username || !this.password) {
      this.showToast('Vui lòng nhập đầy đủ MSSV/Email và Mật khẩu!', 'error');
      return;
    }

    this.loading = true;
    window.setTimeout(() => {
      this.loading = false;
      this.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      window.setTimeout(() => {
        void this.router.navigate(['/gd1']);
      }, 800);
    }, 1200);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    window.setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
