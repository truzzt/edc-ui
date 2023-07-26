import {Component, OnDestroy} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable, Subject} from 'rxjs';
import {filter, finalize, map, takeUntil} from 'rxjs/operators';
import {
  ConfirmDialogModel,
  ConfirmationDialogComponent,
} from '../../../../component-library/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import {AssetService} from '../../../../core/services/api/legacy-managent-api-client';
import {AssetEntryBuilder} from '../../../../core/services/asset-entry-builder';
import {NotificationService} from '../../../../core/services/notification.service';
import {ValidationMessages} from '../../../../core/validators/validation-messages';
import {
  ContractDefinitionEditorDialogResult
} from '../../contract-definition-page/contract-definition-editor-dialog/contract-definition-editor-dialog-result';
import {
  ContractDefinitionEditorDialog
} from '../../contract-definition-page/contract-definition-editor-dialog/contract-definition-editor-dialog.component';
import {AssetCreateDialogForm} from './asset-create-dialog-form';
import {AssetCreateDialogResult} from './asset-create-dialog-result';
import {AssetAdvancedFormBuilder} from './model/asset-advanced-form-builder';
import {AssetDatasourceFormBuilder} from './model/asset-datasource-form-builder';
import {AssetMetadataFormBuilder} from './model/asset-metadata-form-builder';
import {
  ContractDefinitionPageComponent
} from "../../contract-definition-page/contract-definition-page/contract-definition-page.component";


@Component({
  selector: 'asset-create-dialog',
  templateUrl: './asset-create-dialog.component.html',
  providers: [
    AssetAdvancedFormBuilder,
    AssetDatasourceFormBuilder,
    AssetCreateDialogForm,
    AssetEntryBuilder,
    AssetMetadataFormBuilder,
  ],
})
export class AssetCreateDialogComponent implements OnDestroy {
  loading = false;

  methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

  constructor(
    public form: AssetCreateDialogForm,
    public validationMessages: ValidationMessages,
    private assetEntryBuilder: AssetEntryBuilder,
    private notificationService: NotificationService,
    private assetService: AssetService,
    private dialogRef: MatDialogRef<AssetCreateDialogComponent>,
    private matDialog: MatDialog,
  ) {
  }

  onSave() {
    const formValue = this.form.value;
    const assetEntryDto = this.assetEntryBuilder.buildAssetEntry(formValue);

    this.form.all.disable();
    this.loading = true;
    this.assetService
      .createAsset(assetEntryDto)
      .pipe(
        takeUntil(this.ngOnDestroy$),
        finalize(() => {
          this.form.all.enable();
          this.loading = false;
        }),
      )
      .subscribe({
        complete: () => {
          this.notificationService.showInfo('Successfully created asset');
          this.close({refreshList: true});
          console.log(assetEntryDto.asset);
          this.onAssetCreation(formValue.metadata?.id!);
        },
        error: (error) => {
          console.error('Failed creating asset!', error);
          this.notificationService.showError('Failed creating asset!');
          this.close({refreshList: true});
          console.log(assetEntryDto.asset);
          this.onAssetCreation(formValue.metadata?.id!);
        },
      });
  }

  private close(params: AssetCreateDialogResult) {
    this.dialogRef.close(params);
  }

  private onAssetCreation(assetId: string) {
    console.log('the asset id is' + assetId);
    this.confirmCreate(assetId).subscribe(() => {
      complete: () => {
        this.close({refreshList: true});
        const dialogRef = this.matDialog.open(ContractDefinitionEditorDialog);
        dialogRef
          .afterClosed()
          .pipe(
            map((it) => it as ContractDefinitionEditorDialogResult | null),
            filter((it) => !!it?.refreshList),
          ).subscribe(() => ContractDefinitionPageComponent.fetch$.next(null));
      };
    });
  }

  private confirmCreate(assetId: string): Observable<boolean> {
    const dialogData = ConfirmDialogModel.forCreate(
      'asset',
      `"${assetId}"`,
      'contract definition',
    );
    const ref = this.matDialog.open(ConfirmationDialogComponent, {
      maxWidth: '20%',
      data: dialogData,
    });
    return ref.afterClosed().pipe(filter((it) => !!it));
  }

  ngOnDestroy$ = new Subject();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
