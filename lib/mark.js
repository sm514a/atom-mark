'use babel';
import {CompositeDisposable} from 'atom';

export default class Mark {
  constructor(textEditor) {
    this.editor = textEditor;
    this.disposables = new CompositeDisposable(
      atom.commands.add(atom.views.getView(textEditor), {
        'mark:toggle': () => this.toggle(),
        'mark:set-mark': () => this.setMark(),
        'mark:clear-mark': () => this.clearMark(),
        'mark:select-to-mark': () => this.selectToMark(),
        'mark:select-to-mark-and-copy': () => this.selectToMarkAndCopy(),
        'mark:select-to-mark-and-cut': () => this.selectToMarkAndCut(),
        'mark:go-to-mark': () => this.goToMark(),
        'mark:goto-mark': () => this.goToMark(),
        'mark:swap': () => this.swapWithMark(),
      }),
    );
  }

  dispose() {
    if(this.disposables.disposed) return;
    this.disposables.dispose();
    this.clearMark();
    [this.editor, this.marker, this.disposables] = [];
  }

  setMark(point) {
    if(this.marker) {
      this.marker.destroy();
      this.marker = null;
    }
    this.createMark(this.getCursorPoint());
  }
  
  createMark(point) {
    this.clearMark();

    this.marker = this.editor.markBufferPosition(point);
    this.editor.decorateMarker(this.marker, {
      type: 'line-number',
      class: 'marked',
    });

    this.marker.onDidChange(({isValid}) =>
      !isValid && this.clearMark()
    );
  }

  clearMark() {
    if(!this.marker) return;
    this.marker.destroy();
    this.marker = null;
  }

  toggle() {
    if(!this.editor.gutterWithName('line-number').visible) return;
    if(this.marker) {
      this.clearMark();
    } else {
      this.createMark(this.getCursorPoint());
    }
  }

  selectToMark() {
    var markPoint = this.getMarkPoint();
    var cursorPoint = this.getCursorPoint();
    if(!markPoint || cursorPoint.isEqual(markPoint)) return;
    this.editor.setSelectedBufferRange([markPoint, cursorPoint]);
  }

  selectToMarkAndCopy() {
    this.selectToMark();
    this.editor.copySelectedText();
    this.editor.getLastSelection().clear();
    this.clearMark();
  }

  selectToMarkAndCut() {
    this.selectToMark();
    this.editor.cutSelectedText();
    this.clearMark();
  }

  goToMark() {
    var markPoint = this.getMarkPoint();
    if(!markPoint) return;
    this.editor.setCursorBufferPosition(markPoint);
  }

  swapWithMark() {
    var markPoint = this.getMarkPoint();
    var cursorPoint = this.getCursorPoint();
    if(!markPoint || cursorPoint.isEqual(markPoint)) return;
    this.marker.setHeadBufferPosition(cursorPoint);
    this.editor.setCursorBufferPosition(markPoint);
  }

  getMarkPoint() {
    if(!this.marker) return;
    return this.marker.getHeadBufferPosition();
  }

  getCursorPoint() {
    return this.editor.getCursorBufferPosition();
  }
}
