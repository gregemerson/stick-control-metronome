import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import {IExercise} from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-display',
  styles: [`.exercise-canvas {
    border-style: none;
    border-color: green;
  }`],
  template: '<canvas #exerciseCanvas class="exercise-canvas"></canvas>',
})
export class ExerciseDisplay {
  @ViewChild("exerciseCanvas") canvasElement: ElementRef; 
  private exerciseFont = "px Courier, monospace";
  private measureBar = '|';
  // Define the vertical placements of note components
  private graceNotePercentage = .6;
  private accentY: number;
  private accentPaddingY: number;
  private letterY: number;
  private underscoreY: number;
  private groupingFontSizePercent = 0.6;
  private groupingY: number;
  private leftPaddingPercent = 0.1;
  private topPaddingPercent = 0.1;
  private topPaddingY: number;
  private bottomPaddingPercent = 0.1;
  private bottomPaddingY: number;
  // private maxFontSize: number = 16;
  // private minFontSize: number = 10;
  private numberOfLines: number;

  // Define the horzontal placements of noted
  private noteX: number;
  // private noteY: number;
  private noteWidth: number;
  private noteHeight: number;

  private _context: CanvasRenderingContext2D = null;
  private canvas: HTMLCanvasElement;
  private groupingTest = /^[A-Za-z|\-]+$/;
  private accentText = /R|L/;

  public get height(): number {
    return this.numberOfLines * this.noteHeight;
  }

  public get width(): number {
    return this.canvas.width;
  }

  public hide(): void {
    if (this.canvas != undefined) {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
  }

  constructor(private navCtrl: NavController) {
  }

  // All sizing is done relative to the font size
  private get groupingFontSize(): number {
    return this.groupingFontSizePercent * this.currentFontSize;
  }

  private get topPaddingSize(): number {
    return this.topPaddingPercent * this.currentFontSize;
  }

  private get bottomPaddingSize(): number {
    return this.bottomPaddingPercent * this.currentFontSize;
  }

  private get leftPaddingSize(): number {
    // For now
    return 0;
    //return this.leftPaddingPercent * this.currentFontSize;
  }

  private get graceNoteSize(): number {
    return this.noteWidth * this.graceNotePercentage;
  }

  private getContext(): CanvasRenderingContext2D {
    if (this._context == null) {
      this._context = this.canvas.getContext('2d');
      this._context.textBaseline = 'bottom';
      this._context.textAlign = 'left';
      this._context.textBaseline = 'bottom';
    }
    return this._context;
  }

  private get currentFontSize(): number {
    return Number.parseInt(this.getContext().font);
  }

  draw(exercise: IExercise, width: number, maxHeight: number, fontSize: number): number {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = width;
    let lines = this.createLayout(exercise, maxHeight, fontSize);
    let context = this.getContext();
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      this.resetNoteX();
      let lineStart = this.noteX;
      let line = lines[lineIdx];
      let charPos = 0;
      while (charPos < line.length) {
        let numDrawn = 0;
        if (line[charPos].match(this.groupingTest)) {
          let end = charPos + 1;
          while (end < line.length && line[end].match(this.groupingTest)) {
            end++;
          }
          let group = line.substring(charPos, end).toUpperCase();
          context.textBaseline = 'bottom';
          context.strokeText(group, this.noteX, this.letterY);
          this.drawGroupLines(group.length);
          numDrawn = group.length;
        }
        else if (line[charPos] == this.measureBar) {
          this.drawMeasureMark();
          numDrawn = 1;
        }
        else {
          context.strokeText(line[charPos], this.noteX, this.letterY);
          numDrawn = 1;
        }
        this.moveNoteXDistance(numDrawn);
        charPos += numDrawn;
      }
      this.drawAccents(line, lineStart);
      this.moveNextLine();
    }
    return this.canvas.height;
  }

  // Set canvas height 
  private createLayout(exercise: IExercise, maxHeight: number, fontSize: number): Array<string> {
    /*
    let display = exercise.display;
    let groups = new Array<string>();
    let beginGroup = display.indexOf(this.notesMarker) + 1;
    // Get all groups
    for (let i = 0; i < display.length; i++) {
        let char = display[i];
        // Check for end of group
        if (char == this.measureBar || char == ' ' || i == display.length -1) {
          groups.push(display.substring(beginGroup, i + 1));
          beginGroup = i + 1;
        }
    }
    // Now calculate the largest font size such that canvas.height < maxHeight
    let calculatedFontSize = fontSize;
    let numberOfLines = 0;
    let lines = new Array<string>();
    while (calculatedFontSize >= this.minFontSize) {
      this.setupRegions(calculatedFontSize);
      let context = this.getContext();
      let maxNumLines = Math.floor(maxHeight/this.noteHeight);
      let numLines = 1;
      let currentWidth = 0;
      for (let i = 0; i < groups.length; i++) {
        let groupWidth = context.measureText(groups[i]).width;
        if (currentWidth + groupWidth < this.canvas.width) {
          // Add group to line
          currentWidth += groupWidth;
          if (numLines > lines.length) {
            lines.push('');
          }
          lines[numLines - 1] = lines[numLines - 1].concat(groups[i]);
        }
        else {
          // Start on new line
          numLines++;
          if (numLines > maxNumLines) {
            // Didn't fit, try smaller font
            lines.length = 0;
            calculatedFontSize--;
            break;
          }
          lines.push(groups[i]);
          currentWidth = groupWidth;
        }
      }
      if (lines.length > 0) {
        break;
      }
    }
    this.canvas.height = lines.length * this.noteHeight;
    this.setupRegions(calculatedFontSize);
    return lines;
    */
    return null;
  }

  private setupRegions(fontSize: number): void {
    let context = this.getContext();
    context.font = fontSize + this.exerciseFont;
    this.noteWidth = context.measureText('A').width;
    this.topPaddingY = this.topPaddingSize;
    this.accentY = this.topPaddingY + (.2 * this.currentFontSize);
    this.accentPaddingY = this.accentY + (.05 * this.currentFontSize);
    this.letterY = this.accentPaddingY + this.currentFontSize;
    this.underscoreY = this.letterY + (.1 * this.currentFontSize);
    this.groupingY = this.underscoreY + (this.groupingFontSize);
    this.bottomPaddingY = this.groupingY + this.bottomPaddingSize;
    this.noteHeight = this.bottomPaddingY;
    this.resetNoteX();
  }

  private resetNoteX() {
    this.noteX = this.leftPaddingSize;
  }

  private moveNextLine() {
    let distanceY = this.bottomPaddingY;
    this.topPaddingY += distanceY;
    this.accentY += distanceY;
    this.accentPaddingY += distanceY;
    this.letterY += distanceY;
    this.underscoreY += distanceY;
    this.groupingY += distanceY;
    this.bottomPaddingY += distanceY;
    this.resetNoteX();
  }

  private getMeasureLineThickness () {
    return this.noteWidth * .1;
  }

  private moveNoteXDistance(numNotes: number) {
    this.noteX += numNotes * this.noteWidth;
  }

  private drawNote(letter: string, graceNote: GraceNotes): void {

  }

  private drawMeasureMark() {
    let context = this.getContext();
    let oldLineWidth = context.lineWidth;
    let middleX = this.noteX + this.noteWidth/2;
    context.lineWidth = this.getMeasureLineThickness();
    context.beginPath();
    context.moveTo(middleX, this.accentPaddingY);
    context.lineTo(middleX, this.letterY);
    context.stroke();
    context.closePath();
    context.lineWidth = oldLineWidth;
  }

  private drawGroupLines(numNotes: number) {
    let context = this.getContext();
    let oldBaseline = context.textBaseline;
    let oldStrokeStyle = context.strokeStyle;
    let oldLineWidth = context.lineWidth;
    let oldFont = context.font;

    let margin = 0.1 * this.currentFontSize;
    let lineLength = (this.noteWidth * numNotes) + (2 * margin);
    let barLength = margin + ((this.underscoreY - this.letterY)/2);
    let p = {x: this.noteX - margin, y: this.letterY - margin};
    context.lineWidth = .03 * this.currentFontSize;
    // Draw |__________________________| under grouping
    context.beginPath();
    context.moveTo(p.x, p.y);
    p.y = p.y + barLength;
    context.lineTo(p.x, p.y);
    p.x = p.x + lineLength;
    context.lineTo(p.x, p.y);
    p.y = p.y - barLength;
    context.lineTo(p.x, p.y);
    context.stroke();
    context.closePath();
    // Center the grouping count under the element above.
    let numberFontSize = this.groupingY - this.underscoreY;
    context.font = numberFontSize + this.exerciseFont;
    let numberX = this.noteX + lineLength/2 - this.currentFontSize/2;
    context.textBaseline = 'alphabetic';
    context.strokeText(numNotes.toString(), numberX, this.groupingY);

    context.font = oldFont;
    context.textBaseline = oldBaseline;
    context.lineWidth = oldLineWidth;
    context.strokeStyle = oldStrokeStyle;
  }

  drawAccents(group: string, startX: number) {
    let x = startX;
    for (let i = 0; i < group.length; i++) {
      let c = group[i];
      if (c.match(this.accentText)) {
        this.drawAccent(x);
      }
      x += this.noteWidth;
    }
  }

  drawAccent(x: number) {
    let context = this.getContext();
    let middleY = (this.topPaddingY + this.accentY)/2;
    let oldStrokeStyle = context.strokeStyle;
    let oldLineWidth = context.lineWidth;
    let margin = 0.1 * this.currentFontSize;
    context.lineWidth = .05 * this.currentFontSize;
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(x + margin, this.topPaddingY);
    context.lineTo(x + this.noteWidth - margin, middleY);
    context.lineTo(x + margin, this.accentY);
    context.stroke();
    context.closePath();
    context.lineWidth = oldLineWidth;
    context.strokeStyle = oldStrokeStyle;
  }

  ngAfterViewInit() {
    this.canvas = <HTMLCanvasElement>this.canvasElement.nativeElement;
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}

enum GraceNotes {
  Flam,
  Drag,
  Ruff
}

class ExerciseLayout {
  constructor(public lines: Array<string>, public context: CanvasRenderingContext2D) {

  }
}