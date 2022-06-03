import { Injectable } from "@angular/core"; 
import { Subject } from "rxjs";

@Injectable()
export class LoaderService {

    private loaderSubject = new Subject<LoaderState>();
    loaderState = this.loaderSubject.asObservable();

    public showLoader(text:string = ''): void {
        this.loaderSubject.next(<LoaderState>{show: true, text: text});
    }

    public hideLoader(): void {
        this.loaderSubject.next(<LoaderState>{show: false});
    }
}

export interface LoaderState {
    show: boolean;
    text: string;
}