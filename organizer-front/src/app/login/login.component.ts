import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value;
      this.loading = true;
      this.auth.login(username, password, rememberMe).subscribe({
        next: (ok) => {
          this.loading = false;
          if (ok) {
            this.router.navigateByUrl('/app');
          }
        },
        error: () => {
          this.loading = false;
          alert('Invalid credentials. Use admin / admin');
        }
      });
    }
  }
}