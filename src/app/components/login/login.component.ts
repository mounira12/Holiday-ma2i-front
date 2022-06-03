import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginUserRequestModel } from '../../models/LoginUserRequestModel';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { LoaderService } from '../common/loader';
import { AppConsts } from '../../models/common/app-consts';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles:[`
    :host ::ng-deep .p-password input {
    width: 1000rem;
    padding:1rem;
    }

    :host ::ng-deep .pi-eye{
    //   transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
      display : none;
    }

    :host ::ng-deep .pi-eye-slash{
    //   transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    //   display : none;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {

  valCheck: string[] = ['remember'];

  password: string;
  
  config: AppConfig;
  
    subscription: Subscription;

    isLoading: boolean = false;
    returnUrl: string;
    loginForm: FormGroup;
    loginError: any = false;
    emailPattern: string = AppConsts.EMAIL_PATTERN;
    submitted: boolean = false;
    rememberMe: any = false;
    public storeUser: LoginUserRequestModel = new LoginUserRequestModel(
        "",
        "",
        false
    );
    @ViewChild("divLoginPage", { static: true }) divLoginElement: ElementRef;

    _isCheckedRecaptcha: boolean = false;
    set isCheckedRecaptcha(value: boolean) {
        this._isCheckedRecaptcha = value;
    }
    get isCheckedRecaptcha(): boolean {
        return this._isCheckedRecaptcha;
    }

    constructor(
        private route: ActivatedRoute,
        private service: AuthenticationService,
        private router: Router,
        public formBuilder: FormBuilder,
        private loaderService: LoaderService,
        private renderer: Renderer2, public configService: ConfigService
    ) { }

  ngOnInit(): void {
    this.config = this.configService.config;
    this.subscription = this.configService.configUpdate$.subscribe(config => {
      this.config = config;
    });

      
      this.service.isLoginPage.next(true);
      this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
      this.loaderService.hideLoader();
     let email = "";
      const rememberMe = localStorage.getItem(AppConsts.REMEMBER_ME);
      if (rememberMe && rememberMe != null && rememberMe != "")
          this.rememberMe = JSON.parse(rememberMe);

      if (this.rememberMe) {
          email = localStorage.getItem(AppConsts.USER_MAIL);
      }
      this.storeUser = new LoginUserRequestModel(email, "", this.rememberMe);
      this.buildLoginForm();
  }
    buildLoginForm() {
        this.loginForm = this.formBuilder.group({
            Email: [
                "",
                Validators.compose([
                    Validators.maxLength(100),
                    Validators.pattern(this.emailPattern),
                    Validators.required,
                ]),
            ],
            Password: [
                "",
                Validators.compose([Validators.minLength(8), Validators.required]),
            ],
            RememberMe: [""],
        });

        this.loginForm.controls["Email"].valueChanges.subscribe((value) => {
            this.storeUser.UserName = value;
        });

        this.loginForm.controls["Password"].valueChanges.subscribe((value) => {
            this.storeUser.Password = value;
        });

        this.loginForm.controls["RememberMe"].valueChanges.subscribe((value) => {
            this.rememberMe = value;
        });
        this.loginForm.controls["Email"].setValue(this.storeUser.UserName);
        this.loginForm.controls["RememberMe"].setValue(this.storeUser.RememberMe);
    }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

    login($event: MouseEvent) {
        ($event.target as HTMLButtonElement).disabled = true;
        this.submitted = true;
        this.loginError = false;
        if (this.loginForm.invalid) {
            //($event.target as HTMLButtonElement).disabled = false;
            return false;
        }
        this.isLoading = true;
        let user = new LoginUserRequestModel(
            this.storeUser.UserName,
            btoa(this.storeUser.Password),
            this.storeUser.RememberMe
        );
       
        this.service.login(user).subscribe(
            (response: any) => {
                ($event.target as HTMLButtonElement).disabled = false;
                if (response && response != null && !response.isError) {
                   this.signIn(response);
                } else {
                    ($event.target as HTMLButtonElement).disabled = false;
                    this.loginError = true;
                }
                this.isLoading = false;
            },
            (error) => {
                ($event.target as HTMLButtonElement).disabled = false;
                this.loginError = true;
                this.isLoading = false;
            }
        );
        return false;
    }

    signIn(response: any) {
        this.service.isLoginPage.next(false);
        this.service.signIn(response, this.storeUser.UserName, this.rememberMe);
        this.router.navigate([`dashboard`]);
    }
    get f() {
        return this.loginForm.controls;
    }
    gotoResetPassword() {
        this.router.navigate(['newpassword']);
       return false;
      }
}
