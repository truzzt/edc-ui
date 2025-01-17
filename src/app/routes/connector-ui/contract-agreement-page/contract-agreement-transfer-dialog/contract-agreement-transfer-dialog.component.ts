import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {ContractAgreementTransferRequest} from '@sovity.de/edc-client';
import {EdcApiService} from '../../../../core/services/api/edc-api.service';
import {AssetEntryBuilder} from '../../../../core/services/asset-entry-builder';
import {DataAddressMapper} from '../../../../core/services/data-address-mapper';
import {HttpRequestParamsMapper} from '../../../../core/services/http-params-mapper.service';
import {NotificationService} from '../../../../core/services/notification.service';
import {ValidationMessages} from '../../../../core/validators/validation-messages';
import {ContractAgreementTransferDialogData} from './contract-agreement-transfer-dialog-data';
import {ContractAgreementTransferDialogForm} from './contract-agreement-transfer-dialog-form';
import {ContractAgreementTransferDialogFormValue} from './contract-agreement-transfer-dialog-form-model';
import {ContractAgreementTransferDialogResult} from './contract-agreement-transfer-dialog-result';

@Component({
  selector: 'contract-agreement-transfer-dialog',
  templateUrl: './contract-agreement-transfer-dialog.component.html',
  providers: [ContractAgreementTransferDialogForm, AssetEntryBuilder],
})
export class ContractAgreementTransferDialogComponent implements OnDestroy {
  loading = false;

  dataSinkMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  dataSourceMethods = ['GET', ...this.dataSinkMethods];

  get proxyMethod(): boolean {
    return (
      this.showAllHttpParameterizationFields ||
      this.data.asset.httpProxyMethod == true
    );
  }

  get proxyPath(): boolean {
    return (
      this.showAllHttpParameterizationFields ||
      this.data.asset.httpProxyPath == true
    );
  }

  get proxyQueryParams(): boolean {
    return (
      this.showAllHttpParameterizationFields ||
      this.data.asset.httpProxyQueryParams == true
    );
  }

  get proxyBody(): boolean {
    return (
      this.showAllHttpParameterizationFields ||
      this.data.asset.httpProxyBody == true
    );
  }

  get showHttpParameterizationToggleButton(): boolean {
    return (
      this.data.asset.httpProxyMethod !== true ||
      this.data.asset.httpProxyPath !== true ||
      this.data.asset.httpProxyQueryParams !== true ||
      this.data.asset.httpProxyBody !== true
    );
  }

  get showAllHttpParameterizationFields(): boolean {
    return this.form.all.controls.showAllHttpParameterizationFields.value;
  }

  constructor(
    public form: ContractAgreementTransferDialogForm,
    public validationMessages: ValidationMessages,
    private dialogRef: MatDialogRef<ContractAgreementTransferDialogComponent>,
    private edcApiService: EdcApiService,
    private notificationService: NotificationService,
    private httpRequestParamsMapper: HttpRequestParamsMapper,
    private dataAddressMapper: DataAddressMapper,
    @Inject(MAT_DIALOG_DATA) public data: ContractAgreementTransferDialogData,
  ) {}

  onSave() {
    if (this.loading && !this.form.all.valid) {
      return;
    }
    this.loading = true;
    this.form.all.disable();

    this.edcApiService
      .initiateTranfer(this.buildTransferRequest(this.form.value))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.form.all.enable();
        }),
      )
      .subscribe({
        next: (transferProcessId) =>
          this.close({
            transferProcessId,
            contractId: this.data.contractId,
          }),
        error: (err) => {
          this.notificationService.showError('Failed initiating transfer!');
          console.error('Failed initiating transfer', err);
        },
      });
  }

  private close(params: ContractAgreementTransferDialogResult) {
    this.dialogRef.close(params);
  }

  ngOnDestroy$ = new Subject();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }

  private buildTransferRequest(
    value: ContractAgreementTransferDialogFormValue,
  ): ContractAgreementTransferRequest {
    if (value.dataAddressType === 'Custom-Transfer-Process-Request') {
      const customJson: any = JSON.parse(
        value.transferProcessRequest?.trim() ?? '',
      );
      customJson.assetId = this.data.asset.id;
      customJson.contractId = this.data.contractId;
      customJson.connectorAddress = this.data.asset.originator;

      return {
        type: 'CUSTOM_JSON',
        customJson: JSON.stringify(customJson),
      };
    }

    let transferRequestProperties =
      this.httpRequestParamsMapper.encodeHttpProxyTransferRequestProperties(
        this.data.asset,
        value,
      );

    let dataSinkProperties =
      this.dataAddressMapper.buildDataAddressProperties(value).properties ?? {};

    return {
      type: 'PARAMS_ONLY',
      params: {
        contractAgreementId: this.data.contractId,
        properties: transferRequestProperties,
        dataSinkProperties,
      },
    };
  }
}
