import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Để dùng *ngIf, *ngFor

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
      <h1>Angular Minimal + Node.js</h1>
      
      <button (click)="testConnection()" style="padding: 10px 20px; cursor: pointer;">
        Kết nối Backend
      </button>

      <div *ngIf="result" style="margin-top: 20px; color: green;">
        <h3>Phản hồi từ Server:</h3>
        <pre>{{ result | json }}</pre>
      </div>

      <div *ngIf="errorMsg" style="margin-top: 20px; color: red;">
        <h3>{{ errorMsg }}</h3>
      </div>
    </div>
  `
})
export class AppComponent {
  result: any;
  errorMsg: string = '';

  constructor(private http: HttpClient) {}

  testConnection() {
    this.http.get('http://localhost:3000/api/test')
      .subscribe({
        next: (data) => {
          this.result = data;
          this.errorMsg = '';
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Lỗi: Không kết nối được tới Backend (Hãy chắc chắn Node.js đang chạy ở port 3000)';
        }
      });
  }
}