import {Inject, Injectable} from '@angular/core';
import {UiAsset} from '@sovity.de/edc-client';
import {AssetEditorDialogFormValue} from '../../routes/connector-ui/asset-page/asset-create-dialog/asset-editor-dialog-form-model';
import {DataCategorySelectItemService} from '../../routes/connector-ui/asset-page/data-category-select/data-category-select-item.service';
import {DataSubcategorySelectItemService} from '../../routes/connector-ui/asset-page/data-subcategory-select/data-subcategory-select-item.service';
import {LanguageSelectItemService} from '../../routes/connector-ui/asset-page/language-select/language-select-item.service';
import {TransportModeSelectItemService} from '../../routes/connector-ui/asset-page/transport-mode-select/transport-mode-select-item.service';
import {ActiveFeatureSet} from '../config/active-feature-set';
import {APP_CONFIG, AppConfig} from '../config/app-config';
import {removeNullValues} from '../utils/record-utils';
import {trimmedOrNull} from '../utils/string-utils';
import {AssetProperties} from './asset-properties';
import {Asset} from './models/asset';

/**
 * Maps between EDC Asset and our type safe asset
 */
@Injectable({
  providedIn: 'root',
})
export class AssetPropertyMapper {
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private languageSelectItemService: LanguageSelectItemService,
    private transportModeSelectItemService: TransportModeSelectItemService,
    private dataCategorySelectItemService: DataCategorySelectItemService,
    private dataSubcategorySelectItemService: DataSubcategorySelectItemService,
    private activeFeatureSet: ActiveFeatureSet,
  ) {}

  buildAsset(opts: {connectorEndpoint: string; asset: UiAsset}): Asset {
    const asset = opts.asset;

    const language = asset.language
      ? this.languageSelectItemService.findById(asset.language)
      : null;
    const dataCategory = asset.dataCategory
      ? this.dataCategorySelectItemService.findById(asset.dataCategory)
      : null;
    const dataSubcategory = asset.dataSubcategory
      ? this.dataSubcategorySelectItemService.findById(asset.dataSubcategory)
      : null;
    const transportMode = asset.transportMode
      ? this.transportModeSelectItemService.findById(asset.transportMode)
      : null;

    const keywords = asset.keywords ?? [];

    const id = asset.assetId ?? 'no-id-was-set';
    const additionalProperties = this.buildAdditionalProperties(
      asset.additionalProperties,
    );

    return {
      id,
      name: asset.name ?? id,
      version: asset.version ?? null,
      contentType: asset.mediaType ?? null,
      originator: opts.connectorEndpoint,
      originatorOrganization:
        asset.creatorOrganizationName ?? 'Unknown Organization',
      keywords,
      description: trimmedOrNull(asset.description),
      language,
      publisher: asset.publisherHomepage ?? null,
      standardLicense: asset.licenseUrl ?? null,
      endpointDocumentation: asset.landingPageUrl ?? null,
      dataCategory,
      dataSubcategory,
      dataModel: asset.dataModel ?? null,
      geoReferenceMethod: asset.geoReferenceMethod ?? null,
      transportMode,
      httpProxyMethod: this._parseBoolean(asset.httpDatasourceHintsProxyMethod),
      httpProxyPath: this._parseBoolean(asset.httpDatasourceHintsProxyPath),
      httpProxyQueryParams: this._parseBoolean(
        asset.httpDatasourceHintsProxyBody,
      ),
      httpProxyBody: this._parseBoolean(asset.httpDatasourceHintsProxyBody),
      additionalProperties,
    };
  }

  buildUiAssetfromprops(props: Record<string, string>): UiAsset {
    return {
      assetId: props[AssetProperties.id] ?? '',
      name: props[AssetProperties.name] ?? '',
      version: props[AssetProperties.version] ?? '',
      creatorOrganizationName:
        props[AssetProperties.curatorOrganizationName] ?? '',
      keywords: props[AssetProperties.keywords]
        ?.split(',')
        .map((it) => it.trim()),
      mediaType: props[AssetProperties.contentType] ?? '',
      description: props[AssetProperties.description] ?? '',
      language: props[AssetProperties.language] ?? '',
      publisherHomepage: props[AssetProperties.publisher] ?? '',
      licenseUrl: props[AssetProperties.standardLicense] ?? '',
      landingPageUrl: props[AssetProperties.endpointDocumentation] ?? '',
      dataCategory: props[AssetProperties.dataCategory] ?? '',
      dataSubcategory: props[AssetProperties.dataSubcategory] ?? '',
      dataModel: props[AssetProperties.dataModel] ?? '',
      geoReferenceMethod: props[AssetProperties.geoReferenceMethod] ?? '',
      transportMode: props[AssetProperties.transportMode] ?? '',

      httpDatasourceHintsProxyMethod: this._parseBooleanfromString(
        props[AssetProperties.httpProxyMethod],
      ),
      httpDatasourceHintsProxyPath: this._parseBooleanfromString(
        props[AssetProperties.httpProxyPath],
      ),
      httpDatasourceHintsProxyQueryParams: this._parseBooleanfromString(
        props[AssetProperties.httpProxyQueryParams],
      ),
      httpDatasourceHintsProxyBody: this._parseBooleanfromString(
        props[AssetProperties.httpProxyBody],
      ),

      additionalProperties: this.buildAdditionalPropertiesforUiAsset(props),
    };
  }

  private buildAdditionalProperties(
    props: Record<string, string> | undefined,
  ): Array<{key: string; value: string}> {
    if (!props) {
      return [];
    }

    const knownKeys = Object.values(AssetProperties);
    return Object.entries(props)
      .filter(([k]) => !knownKeys.includes(k))
      .map(([key, value]) => ({
        key,
        value: value ?? '',
      }));
  }

  private buildAdditionalPropertiesforUiAsset(
    props: Record<string, string> | undefined,
  ): {[key: string]: string} {
    if (!props) {
      return {};
    }

    const knownKeys = Object.values(AssetProperties);
    const filteredEntries = Object.entries(props).filter(
      ([k]) => !knownKeys.includes(k),
    );

    const result: {[key: string]: string} = {};
    for (const [key, value] of filteredEntries) {
      result[key] = value ?? '';
    }

    return result;
  }

  buildProperties(
    formValue: AssetEditorDialogFormValue,
  ): Record<string, string> {
    const {metadata, advanced, datasource} = formValue;
    const props: Record<string, string | null> = {};
    props[AssetProperties.id] = trimmedOrNull(metadata?.id);
    props[AssetProperties.name] = trimmedOrNull(metadata?.name);
    props[AssetProperties.version] = trimmedOrNull(metadata?.version);
    props[AssetProperties.curatorOrganizationName] = trimmedOrNull(
      this.config.curatorOrganizationName,
    );
    props[AssetProperties.keywords] = trimmedOrNull(
      metadata?.keywords?.join(', '),
    );
    props[AssetProperties.contentType] = trimmedOrNull(metadata?.contentType);
    props[AssetProperties.description] = trimmedOrNull(metadata?.description);
    props[AssetProperties.language] = metadata?.language?.id ?? null;

    props[AssetProperties.publisher] = trimmedOrNull(metadata?.publisher);
    props[AssetProperties.standardLicense] = trimmedOrNull(
      metadata?.standardLicense,
    );
    props[AssetProperties.endpointDocumentation] = trimmedOrNull(
      metadata?.endpointDocumentation,
    );

    if (this.activeFeatureSet.hasMdsFields()) {
      props[AssetProperties.dataCategory] = advanced?.dataCategory?.id ?? null;
      props[AssetProperties.dataSubcategory] =
        advanced?.dataSubcategory?.id ?? null;
      props[AssetProperties.dataModel] = trimmedOrNull(advanced?.dataModel);
      props[AssetProperties.geoReferenceMethod] = trimmedOrNull(
        advanced?.geoReferenceMethod,
      );
      props[AssetProperties.transportMode] =
        advanced?.transportMode?.id ?? null;
    }

    if (datasource?.dataAddressType === 'Http') {
      props[AssetProperties.httpProxyMethod] = this._encodeBoolean(
        datasource?.httpProxyMethod,
      );
      props[AssetProperties.httpProxyPath] = this._encodeBoolean(
        datasource?.httpProxyPath,
      );
      props[AssetProperties.httpProxyQueryParams] = this._encodeBoolean(
        datasource?.httpProxyQueryParams,
      );
      props[AssetProperties.httpProxyBody] = this._encodeBoolean(
        datasource?.httpProxyBody,
      );
    }

    return removeNullValues(props);
  }

  private _parseBoolean(value: boolean | null | undefined): boolean | null {
    if (value != true && value != false) {
      return null;
    }
    return value;
  }

  private _parseBooleanfromString(value: string | null): boolean | undefined {
    if (!value) {
      return undefined;
    }
    return value === 'true';
  }

  private _encodeBoolean(value?: boolean | null): string {
    return value ? 'true' : 'false';
  }
}
