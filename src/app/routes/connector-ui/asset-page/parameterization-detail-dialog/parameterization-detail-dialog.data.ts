export interface ParameterizationDetailDialogData {
  title: string;
  subtitle: string;
  icon: string;
  objectForDetailDialog: assetParameterizationDetail;
}

export interface assetParameterizationDetail {
  [key: string]: string;
}
