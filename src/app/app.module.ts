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
import {ExerciseSetSelectorPage} from '../pages/exercise-set-preview/exercise-set-selector';
import {NewExerciseSetForm} from '../pages/exercise-set-preview/new-exercise-set'
import {MessagesPage} from '../pages/messages/messages';
import {SettingsPage} from '../pages/settings/settings';
import {AudioBuffers} from '../providers/audio-buffers/audio-buffers';
import {Authenticator} from '../providers/authenticator/authenticator';
import {ExerciseSets} from '../providers/exercise-sets/exercise-sets';
import {HttpService} from '../providers/http-service/http-service';
import {Metronome} from '../providers/metronome/metronome';
import {ResourceLibrary} from '../providers/resource-library/resource-library';
import {NewExerciseForm} from '../pages/exercise-set-preview/new-exercise';
import {RepeatForm} from '../pages/exercise-set-preview/repeat';
import {AppButtons} from '../pages/app-buttons/app-buttons';

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
    ExerciseSetSelectorPage,
    RepeatForm,
    GuidePage,
    LoginPage,
    MessagesPage,
    SettingsPage,
    NewExerciseSetForm,
    NewExerciseForm,
    AppButtons
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
    ExerciseSetSelectorPage,
    RepeatForm,
    GuidePage,
    LoginPage,
    MessagesPage,
    SettingsPage,
    NewExerciseSetForm,
    NewExerciseForm,
    AppButtons
  ],
  providers: [
    AudioBuffers,
    Authenticator,
    ExerciseSets,
    HttpService,
    Metronome,
    ResourceLibrary
  ]
})
export class AppModule {}
