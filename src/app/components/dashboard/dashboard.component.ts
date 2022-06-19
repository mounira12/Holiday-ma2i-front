import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/productservice';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import { AppConsts } from 'src/app/models/common/app-consts';
import { AuthenticationService } from 'src/app/service/security/Authentication.service';
import { HolidayService } from 'src/app/service/holiday.service';
import { HolidayFilterRequest } from 'src/app/models/holiday/holidayFilterRequest.model';
import { HolidayStatusEnum } from 'src/app/models/holiday/holidayRequest.model';
import { DateTimeService } from 'src/app/service/datetime.service';
import * as _ from 'lodash';


@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    public totalUsers: number;
    public holidayPendingNumber: number;
    private emailConnectedUser : string;
    private idUser:string;
    private response: any;
    items: MenuItem[];barData: any;
    barOptions: any;

    products: Product[];

    chartData: any;

    chartOptions: any;

    subscription: Subscription;

    config: AppConfig;
    public isAdmin:boolean;
    constructor(private productService: ProductService, public configService: ConfigService, public holidayService: HolidayService
       , private authenticateService: AuthenticationService, public dateTimeService: DateTimeService) {}

    ngOnInit() {

       
        this.authenticateService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            this.isAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;
            this.emailConnectedUser = jwtToken == null ? '' : jwtToken.Username;
        });
        this.loadAllUsers();
        this.loadHolidays();
        
         this.buildChartOptions();
        // this.buildChartData();


        this.config = this.configService.config;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
            //this.updateChartOptions();
        });
 
        this.holidayService.getDashboardHolidays(this.emailConnectedUser).subscribe((response) => {
            let yearGroup = _.groupBy(response.statsByYearAndMonth, 'year');
            let dataSets = this.getDataSets(yearGroup);
            debugger;
            this.barData = {
                labels: this.dateTimeService.months(),
                datasets:dataSets
            };
    
        });
       
       

    }
    loadAllUsers(){
        this.holidayService.getAllUsers().subscribe(result => {
             this.totalUsers = result.length;
        })
      }
      loadHolidays() {
        var request = new HolidayFilterRequest();
        request.FilterStatus = HolidayStatusEnum.HOLIDAY_PENDING_VALIDATION;
        request.emailConnectedUser = this.emailConnectedUser;
        this.holidayService.getHolidaysByFilterRequest(request).subscribe(response => {
          this.holidayPendingNumber = response.totalCount;});
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

   
    getDataSets(yearGroup: any) {
        let dataSets = [];
        let colors = ['#4dc9f6', '#f67019', '#f53794'];
        let index = 0;
    
        _.forOwn(yearGroup, (items, year) => {
            dataSets.push({
            label: year,
            data: this.fillEmptyMonths(yearGroup[year]),
            backgroundColor: index < colors.length ? colors[index] : colors[0]
          });
          index++;
        });
    
        return dataSets;
      }
    

      private buildChartOptions() {
        this.barOptions = {
          chart: {
            height: 300,
            type: "line",
            dropShadow: {
              enabled: true,
              color: "#000",
              top: 18,
              left: 7,
              blur: 10,
              opacity: 0.2
            },
            toolbar: {
              show: false
            }
          },
          series: [],
          dataLabels: {
            enabled: true
          },
          stroke: {
            curve: "straight",
            width: 2,
          },
          grid: {
            show: false
          },
          markers: {
            size: 5
          },
          yaxis: {
            show: false,
            min: 0
          },
          legend: {
            position: "bottom"
          }
        };
      }
    
      fillEmptyMonths(monthsData: any): number[] {
        let result = _.fill(Array(12), 0);
        _.forOwn(result, (count, index) => {
          let monthIndex = parseInt(index);
          if (monthsData.filter(x => x.month == monthIndex + 1).length > 0) {
             result[monthIndex] = monthsData.filter(x => x.month == monthIndex + 1)[0].count;
          }
        });
        return result ;
      }
}
