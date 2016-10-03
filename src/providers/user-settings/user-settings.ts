import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the UserSettings provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserSettings {
  data: any;
  
  // validation code for all properties
  firstExercise: number = 1;
  lastExercise: number = 1;
  numberOfRepititions: number = 20;
  startDelaySeconds: number = 1;
  minTempo: number = 80;
  maxTempo: number = 80;
  stepTempo: number = 0;
  exerciseSetName: string = 'Basic 1';
  private clickSound: string = 'cowbell 1';

  constructor(private http: Http) {
    this.data = null;
  }

  load() {

    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // Temporary
    return Promise.resolve();

/*
    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      this.http.get('path/to/data.json')
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          resolve(this.data);
        });
    });
    */
  }
}

