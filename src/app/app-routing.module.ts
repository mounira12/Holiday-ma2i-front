import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMainComponent } from './app.main.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AccessComponent } from './components/access/access.component';
//import { HolidaysHomeComponent } from './components/list-holidays/list.component';
import { USER_ROLES } from './models/common/app-consts';
import { HolidaysHomeComponent } from './components/list-holidays/list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { HolidayValidComponent } from './components/holiday-valid-form/holiday-valid.component';
import { HolidaysSynthesisComponent } from './components/synthesis/synthesis.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
            },
            {
                path: '',
                component: LoginComponent
            },
            {
                path: 'newpassword',
                component: NewPasswordComponent
            },
            {
                path: 'dashboard', component: AppMainComponent,
                children: [
                    { path: '', component: DashboardComponent },
                    { path: 'list-holidays', component: HolidaysHomeComponent },
                    { path: 'user-list', component: UserListComponent },
                    { path: 'user-profile', component: UserProfileComponent },
                    { path: 'user-profile/:id', component: UserProfileComponent },
                    { path: 'valid/:id', component: HolidayValidComponent},
                    { path: 'synthesis', component: HolidaysSynthesisComponent},
                    { path: 'synthesis/:userid', component: HolidaysSynthesisComponent},
                  /* 
                    {path: 'uikit/formlayout', component: FormLayoutComponent},
                    {path: 'uikit/input', component: InputComponent},
                    {path: 'uikit/floatlabel', component: FloatLabelComponent},
                    {path: 'uikit/invalidstate', component: InvalidStateComponent},
                    {path: 'uikit/button', component: ButtonComponent},
                    {path: 'uikit/table', component: TableComponent},
                    {path: 'uikit/list', component: ListComponent},
                    {path: 'uikit/tree', component: TreeComponent},
                    {path: 'uikit/panel', component: PanelsComponent},
                    {path: 'uikit/overlay', component: OverlaysComponent},
                    {path: 'uikit/media', component: MediaComponent},
                    {path: 'uikit/menu', loadChildren: () => import('./components/menus/menus.module').then(m => m.MenusModule)},
                    {path: 'uikit/message', component: MessagesComponent},
                    {path: 'uikit/misc', component: MiscComponent},
                    {path: 'uikit/charts', component: ChartsComponent},
                    {path: 'uikit/file', component: FileComponent},
                    {path: 'pages/crud', component: CrudComponent},
                    {path: 'pages/timeline', component: TimelineComponent},
                    {path: 'pages/empty', component: EmptyComponent},
                    {path: 'icons', component: IconsComponent},
                    {path: 'blocks', component: BlocksComponent},
                    {path: 'documentation', component: DocumentationComponent}*/
                ],
            },
            {path:'pages/login', component: LoginComponent},
            {path:'pages/error', component: ErrorComponent},
            {path:'pages/notfound', component: NotfoundComponent},
            {path:'pages/access', component: AccessComponent},
            {path: '**', redirectTo: 'pages/notfound'},
        ], {scrollPositionRestoration: 'enabled', anchorScrolling:'enabled'})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
