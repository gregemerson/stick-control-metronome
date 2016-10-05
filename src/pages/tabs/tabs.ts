import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {SettingsPage} from '../settings/settings';
import {ExerciseSetPreviewPage} from '../exercise-set-preview/exercise-set-preview';
import {GuidePage} from '../guide/guide';

@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;
  tab4Root: any;

  constructor() {
    this.tab1Root = HomePage;
    this.tab2Root = SettingsPage;
    this.tab3Root = ExerciseSetPreviewPage;
    this.tab4Root = GuidePage;
  }
}
