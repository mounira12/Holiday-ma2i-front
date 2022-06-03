import {Component, Inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../../models/user.model';
import { HolidayService } from '../../service/holiday.service';
import { LoaderService } from '../common/loader';
import { AuthenticationService } from 'src/app/service/security/Authentication.service';
import { AppConsts } from '../../models/common/app-consts';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    usersList: any[];
    IsAdmin: boolean;
    userEmail: string;
    animal: string;
    name: string;


    allCollaborators: UserModel[];
    collaborators: UserModel[];
    selectedItems: UserModel[];
    filterNom: string;
    filterByNom: any;
    minFilterSize = 2;
    pageSize: number = 15;
    totalRecords: number;
    colspan: number;
    constructor(private holidayService: HolidayService, private router: Router, private loaderService: LoaderService, private authenticateService: AuthenticationService, private confirmationService: ConfirmationService) {
  
  }
   ngOnInit() {
        this.loaderService.showLoader();
       this.loadAllUsers();
       this.authenticateService.authenticationState.subscribe(() => {
           var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
           this.IsAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;

           this.userEmail = jwtToken == null ? '' : jwtToken.Username;
       });
  }

  loadAllUsers(){
    this.holidayService.getAllUsers().subscribe(result => {
        this.usersList = result;
        this.totalRecords = this.usersList.length;
        this.loaderService.hideLoader();
    })
  }


  openDialog(user): void {
    this.router.navigate(['dashboard/user-profile/'+ user.id])
  }

  edit(userId){
  }

    delete(userId) {

        this.confirmationService.confirm({
            message: `Voulez-vous vraiment supprimer cet utilisateur ?`,
            accept: () => {
                this.holidayService.deleteUser(userId).subscribe(res => {
                    this.loadAllUsers();
                })
            }
        });
    
  }

    addUser(): void {
        this.router.navigate(['dashboard/user-profile']);
    }
}

