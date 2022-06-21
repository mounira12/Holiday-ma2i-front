import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from './service/security/Authentication.service';
import { AppConsts } from './models/common/app-consts';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit{

    items: MenuItem[];
    userName: string;
    userId: any;
    constructor(public appMain: AppMainComponent, private authService: AuthenticationService,   private router: Router) { }
    ngOnInit() {
        this.items = [
            {
                label: '',
                icon: 'pi pi-user',
                items: [
                    {label: 'Paramètres', icon: 'pi pi-fw pi-key',command: () => this.resetPassword()},
                    {label: 'Déconnexion', icon: 'pi pi-fw pi-power-off',command: () => this.logout()}
                    
                ]
            }
        ];
        this.authService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            this.userName = jwtToken == null ? '' : jwtToken.FullName;
            this.userId = jwtToken == null ? '' : jwtToken.Id;
        });
           
    }

    logout(){
        console.log(localStorage)
        // localStorage.removeItem('token');
        this.router.navigate(['']);
      }
      resetPassword(){
        // localStorage.removeItem('token');
        this.router.navigate(['dashboard/resetPassword/'+this.userId]);
      }
   





}
