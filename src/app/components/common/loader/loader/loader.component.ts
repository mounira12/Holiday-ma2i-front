import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LoaderService, LoaderState } from '../loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  show = false;
  private subscription: Subscription;
  text: string;

  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
            .subscribe((state: LoaderState) => {
                this.show = state.show;
                this.text = state.text;
            });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}