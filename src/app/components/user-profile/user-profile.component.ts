import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarControllerChartOptions } from 'chart.js';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppConsts } from 'src/app/models/common/app-consts';
import { AuthenticationService } from 'src/app/service/security/Authentication.service';
import { UserModel } from '../../models/user.model';
import { HolidayService } from '../../service/holiday.service';
import { LoaderService } from '../common/loader/loader.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Input() user = new UserModel();
  @Input() isEdit : boolean;
  userId : string;
  public isAdmin:boolean;
    constructor(private holidayService: HolidayService, private router: Router,private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private loaderService: LoaderService,private authenticateService: AuthenticationService,
    private confirmationService: ConfirmationService) {
      this.userId = this.activatedRoute.snapshot.paramMap.get('id');
      if(this.userId) this.LoadUser();
   }

  ngOnInit() {
    this.authenticateService.authenticationState.subscribe(() => {
      var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
      this.isAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;
  });
  }

    save(f) {
        this.confirmationService.confirm({
            message: (this.userId) ? `Voulez-vous vraiment enregistrer vos modifications ?` : `Voulez-vous vraiment enregistrer cet utilisateur ?`,
            accept: () => {
                let successMessage = (this.userId) ? { severity: 'success', summary: "Vos modifications ont été sauvegardées" } : { severity: 'success', summary: "Le nouveau utilisateur est créé avec succés" };
                let errorMessage = { severity: 'error', summary: "Une erreur est surevenu lors de votre sauvegarde" };
                this.loaderService.showLoader("Sauvegarde en cours");

                this.holidayService.saveUser(this.user).subscribe(result => {
                  if (result) {
                    setTimeout(() => {
                      this.messageService.add(successMessage);
                    }, 400);
                        this.router.navigate(['dashboard/user-list']);
                    }
                    else {
                        this.messageService.add(errorMessage);
                    }
                })
            }
        });
   
  }

  
  userMapper(res){
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

  LoadUser(){
this.holidayService.getUserById(this.userId).subscribe(res =>{
 this.userMapper(res);
})
  }

    addUser(): void {
        this.router.navigate(['dashboard/user-profile']);
    }
}
