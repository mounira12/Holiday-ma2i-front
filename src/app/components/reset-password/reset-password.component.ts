import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, Input } from '@angular/core';
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
import { HolidayService } from 'src/app/service/holiday.service';
import { UserModel } from 'src/app/models/user.model';
@Component({
  selector: 'app-reset-password',
  templateUrl:'./reset-password.component.html',
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
export class ResetPasswordComponent implements OnInit, OnDestroy {


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
  userId: any;
user : UserModel;
  email: any;

    set isCheckedRecaptcha(value: boolean) {
        this._isCheckedRecaptcha = value;
    }
    get isCheckedRecaptcha(): boolean {
        return this._isCheckedRecaptcha;
    }
    get f() {
      return this.ResetPasswordForm.controls;
  }
    constructor(
        private route: ActivatedRoute,
        private service: AuthenticationService,
        private router: Router,
        public formBuilder: FormBuilder,
        private loaderService: LoaderService,private activatedRoute: ActivatedRoute,private authenticateService:AuthenticationService,
        private renderer: Renderer2, public configService: ConfigService,private  holidayService:HolidayService,
     ) {  
    
   }

    ngOnInit(): void {
        this.config = this.configService.config;
             this.userId = this.activatedRoute.snapshot.paramMap.get('id');
             this.authenticateService.authenticationState.subscribe(() => {
              var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
              debugger;
              this.email = jwtToken == null ? '' : jwtToken.Username;
          });
            // if(this.userId) this.LoadUser();
           this.resetNewPassword = new ResetPasswordModel(this.email);

             this.buildResetPasswordForm();
    }
    
    
    userMapper(res){
      this.user= new UserModel();
      this.user=res;
      this.user.id = res.id;
      this.user.FirstName = res.firstName;
      this.user.LastName = res.lastName;
      this.user.Country = res.country;
      this.user.PhoneNumber = res.phoneNumber;
      this.user.Email = res.email;
      this.user.Adress = res.adress;
      this.user.City = res.city;
      this.user.PostalCode = res.postalCode;
      this.user.IsAdmin = res.isAdmin;
      this.user.Profession = res.profession;
        }
    buildResetPasswordForm() {
      debugger;
        this.ResetPasswordForm = this.formBuilder.group({
            Email: [
                 this.email,
                  ],
            Password: [
                "",
                Validators.compose([Validators.minLength(8), Validators.required]),
            ],
            PasswordConfirm: ["", Validators.compose([Validators.minLength(8), Validators.required]),
            ]
        });

        this.ResetPasswordForm.controls["Email"].valueChanges.subscribe((value) => {
            this.resetNewPassword.EmailUser =  value ;
        });

        this.ResetPasswordForm.controls["Password"].valueChanges.subscribe((value) => {
            this.resetNewPassword.NewPassword = value;
        });


        this.ResetPasswordForm.controls["PasswordConfirm"].valueChanges.subscribe((value) => {
            this.resetNewPassword.ConfirmNewPassword = value;
        });
if(this.email)
{
this.ResetPasswordForm.controls["Email"].setValue(this.email);
}
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
    saveNewPassword(response:any) {
      debugger;
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
  
    displayMessage() {
        this.router.navigate([``]);

    }
}

