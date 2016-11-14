import {Injectable} from '@angular/core';
import {Http, RequestOptionsArgs, Response} from '@angular/http';
import {Authenticator} from '../authenticator/authenticator';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import {Observer, Subscriber, Subscription} from 'rxjs';
import 'rxjs/add/operator/map';

export type HttpServiceErrors = Array<IHttpServiceError>;

@Injectable()
export class HttpService extends Observable<HttpServiceErrors> {
  static get ClientsCollection(): string {return '/api/Clients/'}
  static get ExerciseSetCollection(): string {return '/api/ExerciseSets/';}
  static get ExerciseCollection(): string {return '/api/Exercises/';}
  static exerciseSetExercises(exerciseSetId: number): string {
    return '/api/ExerciseSets/' + exerciseSetId.toString() + '/exercises';
  }
  static exercise(exerciseId: number): string {
    return '/api/Exercises/' + exerciseId.toString();
  }
  static userSettings(userId: number): string {
    return 'api/Clients/' + userId.toString() + '/userSettings';
  }
  
  private subscribers: {[key: string]: Subscriber<HttpServiceErrors>} = {};
  private static globalErrorCodes = {
    INVALID_TOKEN: 'Your session has expired, please re-log in.',
    AUTHORIZATION_REQUIRED: 'Unauthorized access attempt.'
  }

  constructor(private http: Http) {
    super((subscriber: Subscriber<HttpServiceErrors>) => {
      let key = Math.random().toString();
      this.subscribers[key] = subscriber;
      return new HttpServiceErrorSubscription(() => {
        delete this.subscribers[key];
      });
    });
  }

  postPersistedObject(url: string,  data: any, requestOptions = Authenticator.newRequestOptions()): Observable<Object> {
    return Observable.create((observer: Observer<Object>) => {
      try {
        this.http.post(url, data, requestOptions)
          .map(response => this.processResponse(response, observer))
          .subscribe({
            next: () => {},
            error: (err: any) => observer.error(err)
          });
      }
      catch(err) {
        observer.error({message: 'No server response.'});
        // @todo Remote error logging
      }
    });
  }

  putPersistedObject(url: string,  data: any, requestOptions = Authenticator.newRequestOptions()): Observable<Object> {
    return Observable.create((observer: Observer<Object>) => {
      try {
        this.http.put(url, data, requestOptions)
          .map(response => this.processResponse(response, observer))
          .subscribe({
            next: () => {},
            error: (err: any) => observer.error(err)
          });
      }
      catch(err) {
        observer.error({message: 'No server response.'});
        // @todo Remote error logging
      }
    });
  }
  
  getPersistedObject(url: string, requestOptions = Authenticator.newRequestOptions()): Observable<Object> {
    return Observable.create((observer: Observer<Object>) => {
      try {
        this.http.get(url, requestOptions)
          .map(response => this.processResponse(response, observer))
          .subscribe({
            next: () => {},
            error: (err: any) => observer.error(err)
          });
      }
      catch(err) {
        observer.error({message: 'No server response.'});
        // @todo Remote error logging
      }
    });
  }

  private processResponse(response: Response, observer: Observer<Object>) {
    let obj = <Object>response.json();
    let errors = this.parseForErrors(obj);
    if (errors.length == 0) {
      observer.next(obj);
      observer.complete();
    }
    observer.error(errors);
  }

  private handleError (error: any) {
    let errMsg = error.message || 'Server error';
    console.log(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  // @todo Need to check for status 200
  private parseForErrors(obj: Object): Array<IHttpServiceError> {
    let errors: Array<IHttpServiceError> = [];
    if (!obj.hasOwnProperty('error')) {
      return <[IHttpServiceError]>[];
    }
    let error: Object = obj['error'];
    if (error.hasOwnProperty('code')) {
      let code = error['code'];
      for (let globalCode in HttpService.globalErrorCodes) {
        if (globalCode == code) {
          errors.push({
              code: globalCode,
              message: HttpService.globalErrorCodes[code]
          });
          for (let id in this.subscribers) {
            if(!this.subscribers[id]) {
              this.subscribers[id].next(errors);
            }
          }
          return errors;
        }
      }
    }
    // Do generic error parsing here
    if (error.hasOwnProperty('details') && error['details'].
        hasOwnProperty('messages')) {
      let messages = error['details']['messages'];
      for (let key in messages) {
        errors.push({
          code: key,
          message: messages[key]
        });
      }
    }
    else {
      errors.push({
        code: 'Unknown',
        message: (<Object>error['error']).toString()
      });
    }
    return errors;
  }
}

class HttpServiceErrorSubscription extends Subscription {
  constructor(unsubsribe: () => void) {
    super(() => {
      unsubsribe();
    });
  } 
}

export interface IHttpServiceError {
  code: string;
  message : string;
}