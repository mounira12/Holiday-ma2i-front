import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/productservice';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import { AppConsts } from 'src/app/models/common/app-consts';
import { AuthenticationService } from 'src/app/service/security/Authentication.service';
 
@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    items: MenuItem[];barData: any;
    barOptions: any;

    products: Product[];

    chartData: any;

    chartOptions: any;

    subscription: Subscription;

    config: AppConfig;
    public isAdmin:boolean;
    constructor(private productService: ProductService, public configService: ConfigService,
        private authenticateService: AuthenticationService) {}

    ngOnInit() {

        this.authenticateService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            this.isAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;
        });

        
        this.config = this.configService.config;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
            debugger;
            this.updateChartOptions();
        });
        this.barData = {
            labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
            datasets: [
                {
                    label: 'Congés validés',
                    backgroundColor: '#2f4860',
                    data: [5, 9, 8, 8, 5, 6, 7]
                },
                {
                    label: 'Congés refusés',
                    backgroundColor: '#00bb7e',
                    data: [1, 2, 4, 1, 6, 5, 3]
                }
            ]
        };

    }

    updateChartOptions() {
        if (this.config.dark)
            this.applyDarkTheme();
        else
            this.applyLightTheme();
    }
    applyLightTheme() {
       
        this.barOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef',
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef',
                    }
                },
            }
        };

       
      
    }
    applyDarkTheme() {
       
        this.barOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)',
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)',
                    }
                },
            }
        };

      
    }

    
    
}
