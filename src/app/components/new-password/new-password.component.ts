import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ConfigService } from '../../service/app.config.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginUserRequestModel } from '../../models/LoginUserRequestModel';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { LoaderService } from '../common/loader';
import { AppConsts } from '../../models/common/app-consts';
import { AppConfig } from 'src/app/api/appconfig';
import { ResetPasswordModel } from '../../models/ResetPasswordModel';
@Component({
  selector: 'app-new-password',
  templateUrl:'./new-password.component.html',
  styles:[`
    :host ::ng-deep .p-password input {
    width: 100%;
    padding:1rem;
    }

    :host ::ng-deep .pi-eye{
      transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    }

    :host ::ng-deep .pi-eye-slash{
      transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    }
  `]
})
export class NewPasswordComponent implements OnInit, OnDestroy {


    valCheck: string[] = ['remember'];

    password: string;
    PasswordConfirm: string;
    config: AppConfig;

    subscription: Subscription;

    isLoading: boolean = false;
    returnUrl: string;
    ResetPasswordForm: FormGroup;
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
    resetNewPassword: ResetPasswordModel;
    isVisible: boolean;
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
             this.loaderService.hideLoader();
        let email = "";

        this.resetNewPassword = new ResetPasswordModel(email);
        this.buildResetPasswordForm();
    }
    gotoResetPassword() {
        this.router.navigate(['newpassword']);
        return false;
    }
    buildResetPasswordForm() {
        this.ResetPasswordForm = this.formBuilder.group({
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
            PasswordConfirm: ["", Validators.compose([Validators.minLength(8), Validators.required]),
            ]
        });

        this.ResetPasswordForm.controls["Email"].valueChanges.subscribe((value) => {
            this.resetNewPassword.EmailUser = value;
        });

        this.ResetPasswordForm.controls["Password"].valueChanges.subscribe((value) => {
            this.resetNewPassword.NewPassword = value;
        });


        this.ResetPasswordForm.controls["PasswordConfirm"].valueChanges.subscribe((value) => {
            this.resetNewPassword.ConfirmNewPassword = value;
        });

    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    checkPasswords(event: any) {
       
        if(event)
        {
        let pass = this.ResetPasswordForm.get('Password').value;
  
        let confirmPass = this.ResetPasswordForm.get('PasswordConfirm').value;
if(confirmPass!=pass)
{
        this.ResetPasswordForm.controls['PasswordConfirm'].setErrors({
    'notSame': true

})
}
else         this.ResetPasswordForm.controls['PasswordConfirm'].setErrors(null)
}
    }

        
    

    signIn(response: any) {
        this.service.isLoginPage.next(false);
        this.service.signIn(response, this.storeUser.UserName, this.rememberMe);
        this.router.navigate([`dashboard`]);
    }
    saveNewPassword(response: any) {
        this.submitted = true;
        if (this.ResetPasswordForm.invalid)
            return;
        this.loaderService.showLoader();
        this.service.setNewPassword(this.resetNewPassword).subscribe((response: any) => {
            this.loaderService.hideLoader();
            if (response != null && response.succeeded == true) {
                this.isVisible = true;
            }
            else 
            {
                this.isVisible = false;
                this.loginError=true;
            }
         
        }, (error) => {
            this.isVisible = false;

            this.loginError=true;

            this.loaderService.hideLoader();
        });
    }
    get f() {
        return this.ResetPasswordForm.controls;
    }

    displayMessage() {
        this.router.navigate([``]);

    }
}

