import {NgModule} from '@angular/core';
import {IonicApp, IonicModule} from 'ionic-angular';
import {StickControlMetronome} from './app.component';
import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';
import {CountDownPage} from '../pages/countdown/countdown';
import {ExerciseDisplay} from '../pages/exercise-display/exercise-display';
import {ExerciseSetPreviewPage} from '../pages/exercise-set-preview/exercise-set-preview'
import {GuidePage} from '../pages/guide/guide';
import {LoginPage} from '../pages/login/login';
import {MessagesPage} from '../pages/messages/messages';
import {SettingsPage} from '../pages/settings/settings';
import {AudioBuffers} from '../providers/audio-buffers/audio-buffers';
import {Authenticator} from '../providers/authenticator/authenticator';
import {ExerciseSets} from '../providers/exercise-sets/exercise-sets';
import {HttpService} from '../providers/http-service/http-service';
import {Metronome} from '../providers/metronome/metronome';
import {ResourceLibrary} from '../providers/resource-library/resource-library';
import {UserSettings} from '../providers/user-settings/user-settings';


@NgModule({
  declarations: [
    StickControlMetronome,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    CountDownPage,
    ExerciseDisplay,
    ExerciseSetPreviewPage,
    GuidePage,
    LoginPage,
    MessagesPage,
    SettingsPage
  ],
  imports: [
    IonicModule.forRoot(StickControlMetronome, {prodMode: false})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    StickControlMetronome,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    CountDownPage,
    ExerciseDisplay,
    ExerciseSetPreviewPage,
    GuidePage,
    LoginPage,
    MessagesPage,
    SettingsPage
  ],
  providers: [
    AudioBuffers,
    Authenticator,
    ExerciseSets,
    HttpService,
    Metronome,
    ResourceLibrary,
    UserSettings
  ]
})
export class AppModule {}
