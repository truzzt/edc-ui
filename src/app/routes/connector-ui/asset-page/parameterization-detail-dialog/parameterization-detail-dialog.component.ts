import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ParameterizationDetailDialogData} from './parameterization-detail-dialog.data';

@Component({
  selector: 'app-parameterization-detail-dialog',
  templateUrl: './parameterization-detail-dialog.component.html',
})
export class ParameterizationDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ParameterizationDetailDialogData,
  ) {}

  Object = Object;
}
