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
  private guestToken = 'MCLXGi20lLDTXRBTWkiz7sbQXRx5qk8IPEcwTFBhlYPTDfG0WZDDAhjYHDuIaBEX';
  private guestEmail = 'guest@guest.com';
  private guestPassword = 'guest';
  private guestUid = '57d5a393b1ba1b20289231e0';
  private userLoadFilter = '?filter[include]=userSettings&filter[include]=exerciseSets';
  private _user: IAuthUser = null;
  errors: Object;

  constructor(private http: Http, private httpService: HttpService) {
    super();
  }

  get user(): IAuthUser {
    return this._user;
  }

  private saveUserSettings(): Observable<Object> {
    return this.httpService.putPersistedObject(HttpService.
      userSettings(this.user.id), this.user.settings);
  }
  
  private setUser(user: IAuthUser) {
    if (this._user != null && this._user.id == user.id) {
      return;
    }
    this._user = user;
    for (let subscriberId in this.subscribers) {
      this.subscribers[subscriberId].next(user);
    }
  }

  private get token(): string {
    return localStorage.getItem(Authenticator.tokenKey);
  }

  private set token(token: string ) {
    localStorage.setItem(Authenticator.tokenKey, token);
  }

    private get uid(): number {
      let id = localStorage.getItem(Authenticator.uidKey);
      if (id != null) {
        return parseInt(id);
      }
      return null;
  }

  private set uid(token: number) {
    localStorage.setItem(Authenticator.uidKey, token.toString());
  }

  private unsetUser() {
    this._user = null;
    localStorage.removeItem(Authenticator.tokenKey);
    localStorage.removeItem(Authenticator.uidKey);
    for (let subscriberId in this.subscribers) {
      this.subscribers[subscriberId].next(null);
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

  loginGuest(): Observable<void> {
    localStorage.setItem(Authenticator.tokenKey, this.guestToken);
    localStorage.setItem(Authenticator.uidKey, this.guestUid);
    return this.loadUser();
  }

  login(email: String, password: String): Observable<void> {
    this.token = '';
    return this.http.post('/api/Clients/login', JSON.stringify({
      email: email,
      password: password
    }), Authenticator.newRequestOptions())
    .map((response : Response) => {
      let data = this.handleErrors(response);
      this.token = data['id'];
      this.uid = data['userId'];
      return data['userId'];
    }).flatMap((id: number, index: number) => {
      return this.loadUser();
    })
  }


  loadUser(): Observable<void> {
    return this.http.get('/api/Clients/' + localStorage.getItem(
      Authenticator.uidKey) + this.userLoadFilter,
      Authenticator.newRequestOptions())
    .map((response : Response) => {
      let user= this.handleErrors(response);
      this.setUser(new AuthUser(user));
    });
  }

  private handleError (error: any) {
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
    let hasLocalAuthData = (this.token != null && this.uid != null);
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

  logout(): Observable<Object> {
    let options = Authenticator.newRequestOptions();
    this.unsetUser();
    return this.httpService.postPersistedObject(HttpService.logout(), {}, options)
    .map((res : any) => {
      return res;
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
  id: number;
  username: string;
  membershipEnds: Date;
  email: string;
  emailVerified: boolean;
  rawExerciseSets: Array<Object>;
}

class AuthUser implements IAuthUser {
  settings: IAuthUserSettings;
  id: number;
  username: string;
  membershipEnds: Date;
  email: string;
  emailVerified: boolean;
  rawExerciseSets: Array<Object>;
  
  constructor(rawUser: Object) {
    Object.assign(this, rawUser);
    this.settings = new AuthUserSettings(rawUser['userSettings']);
    this.membershipEnds = new Date(rawUser['membershipExpiry']);
    this.rawExerciseSets = rawUser['exerciseSets'];
  }
}

export interface IAuthUserSettings {
  currentExerciseSet: number;
  numberOfRepititions: number;
  secondsBeforeStart: number;
  minTempo: number;
  maxTempo: number;
  tempoStep: number;
  id: number;
}

class AuthUserSettings implements IAuthUserSettings {
  currentExerciseSet: number;
  numberOfRepititions: number;
  secondsBeforeStart: number;
  minTempo: number;
  maxTempo: number;
  tempoStep: number;
  id: number;

  constructor(rawSettings: Object) {
    Object.assign(this, rawSettings);
  }  
}

class LoginSubscription extends Subscription {
  constructor(unsubsribe: (id: string) => void, id: string) {
    super(() => {
      unsubsribe(id);
    });
  } 
}
