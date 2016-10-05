import {Injectable, EventEmitter, Output} from '@angular/core';
import {Http, Headers, Response, RequestOptionsArgs} from '@angular/http';
import {ExerciseSets} from '../exercise-sets/exercise-sets';
import {HttpService} from '../http-service/http-service';
import {Observable} from 'rxjs/Observable';
import {Observer, Subscriber, Subscription} from "rxjs";
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {BaseObservable} from '../../utilities/base-observable';

@Injectable()
export class Authenticator extends BaseObservable<IAuthUser> {
  private static tokenKey = 'auth_token';
  private static uidKey = 'uid';
  private token: string;
  private uid: string;
  private guestToken = 'MZZKUi7XVyUbsDnkPlUxOSmEJC1bWap2We2Wofnct6LVpumpsuRpZErvvCNFGF3G';
  private guestEmail = 'guest@guest.com';
  private guestPassword = 'guest';
  private guestUid = '57d5a393b1ba1b20289231e0';
  private userLoadFilter = '?filter[include][exerciseSets]';
  private _user: IAuthUser = null;
  errors: Object;

  constructor(private http: Http, private httpService: HttpService) {
    super();
  }

  get user(): IAuthUser {
    return this._user;
  }
  
  private setUser(user: IAuthUser) {
    this._user = user;
    for (let subscriberId in this.subscribers) {
      this.subscribers[subscriberId].next(user);
    }
  }

  static newRequestOptions(): RequestOptionsArgs {
    return {
      headers: new Headers({
        'Authorization': localStorage.getItem(Authenticator.tokenKey),
        'Content-Type': 'application/json'
      })
    };
  }

  createUser(email: string, password: string, username: string): Observable<Object> {
    return this.httpService.postPersistedObject(HttpService.ClientsCollection, {
      username: username,
      password: password,
      email: email
    });
  }

  static get userId(): string {
    return localStorage.getItem(Authenticator.uidKey);
  }

  loginGuest(): Observable<void> {
    localStorage.setItem(Authenticator.tokenKey, this.guestToken);
    localStorage.setItem(Authenticator.uidKey, this.guestUid);
    return this.loadUser();
  }

  login(email: String, password: String): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      try {
        this.token = '';
        this.http.post('/api/Clients/login', JSON.stringify({
          email: email,
          password: password
        }), Authenticator.newRequestOptions())
        .map((response : Response) => {
          let data = this.handleErrors(response);
          this.token = data['id'];
          localStorage.setItem(Authenticator.uidKey, data['userId'])
          localStorage.setItem(Authenticator.tokenKey, this.token);
          return data['userId'];
        })
        .subscribe((id) => {
          this.internalLoadUser(observer)
            .subscribe();
        });
      }
      catch(err) {
        observer.error({message: 'Could not log in user.'});
        // @todo remote error logging
      }
    });
  }

  loadUser() : Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      try {
        this.internalLoadUser(observer)
        .subscribe();
      }
      catch (err) {
        observer.error(err);
      }
    });
  }

  private internalLoadUser(observer: Observer<void>): Observable<void> {
    return Observable.create((obs: Observer<void>) => {     
      this.http.get('/api/Clients/' + localStorage.getItem(Authenticator.uidKey) + this.userLoadFilter,
        Authenticator.newRequestOptions())
      .map((response : Response) => {
        let user= this.handleErrors(response);
        this.setUser(new AuthUser(user));
      })
      .subscribe({next: () => {}, error: (err: any) => observer.error(err)});
    });
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return ErrorObservable.create(errMsg);
  }

  private handleErrors(response: Response): Object {
    let data = <Object>response.json();
    if (data.hasOwnProperty('error')) {
      throw this.createError(data['error']);
    }
    return data;
  }

  checkLocalAuthData(): Observable<void> {
    this.token = localStorage.getItem(Authenticator.tokenKey) ;
    this.uid = localStorage.getItem(Authenticator.uidKey);
    let hasLocalAuthData = this.token != null && this.uid != null; 
    if (!hasLocalAuthData) {
      return Observable.throw(null);
    }
    return this.loadUser();
  }

  private createError (error: Object):  AuthErrors {
    let authErrors = new AuthErrors();
    if (error.hasOwnProperty('details') && error['details'].
        hasOwnProperty('messages')) {
      let messages = error['details']['messages'];
      for (let key in messages) {
        if (messages[key].length > 0) {
          authErrors.add(key, messages[key][0]);
        }
      }
    }
    else {
      authErrors.add('error', error['message']);
    }
    return authErrors;
  }

  logout(): Observable<void> {
    return this.http.get('/api/Clients/logout', Authenticator.newRequestOptions())
    .map((res : any) => {
      this.token = null;
      this._user = null;
      localStorage.removeItem(Authenticator.tokenKey);
      localStorage.removeItem(Authenticator.uidKey);
    });
  }
}

export class AuthErrors {
  private _subjects: Array<string> = [];
  private _messages: Array<string> = [];
  private _count = 0;
  constructor() {
  }

  add(subject: string, message: string) {
    this._subjects.push(subject);
    this._messages.push(message);
  }

  get count(): number {
    return this._subjects.length;
  }

  subject(index: number): string {
    return this._subjects[index];
  }

  message(index: number): string {
    return this._messages[index];
  }
}

export interface IAuthUser {
  settings: IAuthUserSettings;
  id: string;
  userName: string;
  membershipExpiry: Date;
  email: string;
  emailVerified: boolean;
  rawExerciseSets: Array<Object>;
}

class AuthUser implements IAuthUser {
  settings: IAuthUserSettings;
  id: string;
  userName: string;
  membershipExpiry: Date;
  email: string;
  emailVerified: boolean;
  rawExerciseSets: Array<Object>;
  
  constructor(rawUser: Object) {
    this.id = rawUser['id'];
    this.settings = new AuthUserSettings(rawUser['_userSettings']);
    this.userName = rawUser['username'];
    this.membershipExpiry = new Date(rawUser['membershipExpiry']);
    this.email = rawUser['email'];
    this.emailVerified = rawUser['emailVerified'];
    this.rawExerciseSets = rawUser['exerciseSets'];
  }
}

export interface IAuthUserSettings {
  currentExerciseSetId: number;
  numberOfRepititions: number;
  minTempo: number;
  maxTempo: number;
  tempoStep: number;  
}

class AuthUserSettings implements IAuthUserSettings {
  currentExerciseSetId: number;
  numberOfRepititions: number;
  minTempo: number;
  maxTempo: number;
  tempoStep: number;  

  constructor(rawSettings: Object) {
    this.currentExerciseSetId = rawSettings['currentExerciseSet'];
    this.numberOfRepititions = rawSettings['numberOfRepititions'];
    this.minTempo = rawSettings['minTempo'];
    this.maxTempo = rawSettings['maxTempo'];
    this.tempoStep = rawSettings['tempoStep'];
  }
}

class LoginSubscription extends Subscription {
  constructor(unsubsribe: (id: string) => void, id: string) {
    super(() => {
      unsubsribe(id);
    });
  } 
}
