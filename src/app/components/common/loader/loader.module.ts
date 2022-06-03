import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { LoaderService } from './loader.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LoaderComponent],
  providers: [LoaderService],
  exports: [
    LoaderComponent
  ]
})
export class LoaderModule { }
