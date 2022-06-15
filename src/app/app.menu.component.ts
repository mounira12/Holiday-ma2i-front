import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { AppConsts } from './models/common/app-consts';
import { AuthenticationService } from './service/security/Authentication.service';

@Component({
    selector: 'app-menu',
    template: `
        <div class="layout-menu-container">
            <ul class="layout-menu" role="menu" (keydown)="onKeydown($event)">
                <li app-menu class="layout-menuitem-category" *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true" role="none">
                    <div class="layout-menuitem-root-text" [attr.aria-label]="item.label">{{item.label}}</div>
                    <ul role="menu">
                        <li app-menuitem *ngFor="let child of item.items" [item]="child" [index]="i" role="none"></li>
                    </ul>
                </li>
             
            </ul>
        </div>
    `
})
export class AppMenuComponent implements OnInit {

    model: any[];

    constructor(public appMain: AppMainComponent, public authenticateService: AuthenticationService) { }

    ngOnInit() {
        var isAdmin=true;
        var idUser;
        this.authenticateService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            isAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;
            idUser = jwtToken == null ? '' : jwtToken.Id;
        });
        
        if(isAdmin)
        {
        this.model = [
            {
                label: 'Acceuil',
                items:[
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard']}
                ]
            },
            {
                label: 'Pages',
                items: [
                    { label: 'Gestion des congés', icon: 'pi pi-fw pi-cog', routerLink: ['/dashboard/list-holidays'] },
                    { label: 'Synthèse des congés', icon: 'pi pi-fw pi-file', routerLink: ['/dashboard/synthesis'] },
                    { label: 'Gestion des utilisateurs', icon: 'pi pi-fw pi-user', routerLink: ['/dashboard/user-list'] },
                     ]
            }         
        ];}
        else 
        {
            this.model = [
            {
                label: 'Acceuil',
                items:[
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard']}
                ]
            },
            {
                label: 'Pages',
                items: [
                    { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/dashboard/user-profile/'+ idUser] },
                    { label: 'Demandes de congés', icon: 'pi pi-fw pi-cog', routerLink: ['/dashboard/list-holidays'] },
                    { label: 'Synthèse des congés', icon: 'pi pi-fw pi-file', routerLink: ['/dashboard/synthesis'] }
                   
                    ]
                }     
        ];   
    }
    }

    onKeydown(event: KeyboardEvent) {
        const nodeElement = (<HTMLDivElement> event.target);
        if (event.code === 'Enter' || event.code === 'Space') {
            nodeElement.click();
            event.preventDefault();
        }
    }
}
