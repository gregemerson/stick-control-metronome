import {Component} from '@angular/core';
import {Platform, Modal, ModalController, PopoverController, LoadingController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TabsPage} from '../pages/tabs/tabs';
import {UserSettings} from '../providers/user-settings/user-settings';
import {ResourceLibrary} from '../providers/resource-library/resource-library';
import {Authenticator, IAuthUser} from '../providers/authenticator/authenticator';
import {ExerciseSets} from '../providers/exercise-sets/exercise-sets';
import {LoginPage} from '../pages/login/login';
import {MessagesPage, IMessage, MessageType} from '../pages/messages/messages';
import {BaseObservableSubscription} from "../utilities/base-observable";
import {HttpService, IHttpServiceError, HttpServiceErrors} from '../providers/http-service/http-service';

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  providers: [UserSettings, ResourceLibrary, ExerciseSets, Authenticator, ModalController, PopoverController, HttpService]
})
export class StickControlMetronome {
  rootPage: any;
  private userLoadedSubscription: BaseObservableSubscription;
  constructor(private platform: Platform, 
    public userSettings: UserSettings, 
    public resourceLibrary: ResourceLibrary,
    public exerciseSets: ExerciseSets,
    public authenticator: Authenticator,
    public httpService: HttpService,
    public modalController: ModalController,
    private popoverController: PopoverController,
    private loadingCtrl: LoadingController) {

    this.rootPage = TabsPage;
    platform.ready().then(() => {
      // Listen for errors forcing navigation to login page
      this.httpService.subscribe(({next: (errors: HttpServiceErrors) => {
        let displayErrors: Array<IHttpServiceError> = [];
        for (let error of errors) {
          if (error.code == 'INVALID_TOKEN') {
            displayErrors.length = 0;
            displayErrors.push(error);
            this.displayLogInPage();
            break;
          }
          else if (error.code == 'AUTHORIZATION_REQUIRED') {
            displayErrors.length = 0;
            displayErrors.push(error);
            break;
          }
          else {
            displayErrors.push(error);
          }
        }
        let display = new Array<IMessage>();
        for (let error of displayErrors) {
          display.push(MessagesPage.createMessage(
            error.code, error.message, MessageType.Error));
        }
        this.popoverController.create(
          MessagesPage, {messages: displayErrors}).present();
      }}));

      // Listen for the IAuthUser being loaded
      this.userLoadedSubscription = authenticator.subscribe({
        next: (user: IAuthUser) => {
          if (user == null) {
            this.unloadUserData();
            this.displayLogInPage();
            return;
          }
          this.loadUserData(user);
      }});

      authenticator.checkLocalAuthData().subscribe({
        next: () => {
          // Has local auth data
        },
        error: (err: any) => {
          console.log(err);
          let modal = this.modalController.create(
            LoginPage, {authenticator: authenticator});
          modal.present();
        },
        complete: () => {
        }});

      StatusBar.styleDefault();
    });
  }

  private displayLogInPage() {
    this.modalController.
      create(LoginPage,{authenticator: this.authenticator}).present();
  }

  private unloadUserData(): void {
    this.exerciseSets.unload();
  }

  private loadUserData(user: IAuthUser): void {
    let loading = this.loadingCtrl.create();
    loading.present();
    this.exerciseSets.load(user).subscribe({
      next: () => {
        loading.dismiss();
      },
      error: (err: any) => {
        this.popoverController.create(MessagesPage, {
          messages: [MessagesPage.createMessage(
            'Error', err, MessageType.Error)]
        }).present();
      }
    });
  }
}
