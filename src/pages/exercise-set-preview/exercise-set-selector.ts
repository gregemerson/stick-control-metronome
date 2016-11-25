import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-set-selector',
  templateUrl: 'exercise-set-selector.html',
})
export class ExerciseSetSelectorPage {
  private onSelect: (exerciseSetId: number) => void;
  private exerciseSets: ES.IExerciseSet[];
  categories: ExerciseSetCategory[];
  selectionId: number;

  constructor(private navCtrl: NavController, 
    private navParams: NavParams) {
    this.onSelect = navParams.get('onSelect');
    this.selectionId = navParams.get('currentSelectionId');
    this.exerciseSets = navParams.get('exerciseSets');
    this.createCategories();
  }

  onOk() {
    this.onSelect(this.selectionId);
    this.navCtrl.pop();
  }

  onCancel() {
    this.navCtrl.pop();
  }

  private createCategories() {
    let categoriesObj: Object = {};
    for (let set of this.exerciseSets) {
      if (!categoriesObj.hasOwnProperty(set.category)) {
        categoriesObj[set.category] =
          new ExerciseSetCategory(set.category);
      }
      categoriesObj[set.category].push(new 
        ExerciseSetSelection(set.name, set.id));
    }

    this.categories = [];
    for (let key in categoriesObj) {
      this.sortByName(categoriesObj[key]);
      this.categories.push(categoriesObj[key]);
    }
    this.sortByName(this.categories);
  }

  private sortByName(a: Named[]) {
    a.sort((n1: Named, n2: Named) => {
      return n1.name.toLowerCase().localeCompare(n2.name.toLowerCase());
    });
  }

  close() {
    this.navCtrl.pop();
  }
}

export interface Named {
  name: string;
}

export class ExerciseSetCategory extends 
  Array<ExerciseSetSelection> implements Named {
  constructor(public name: string) {
    super();
  }
}

export class ExerciseSetSelection implements Named{
  constructor(public name: string, public id: number) {
  }
}