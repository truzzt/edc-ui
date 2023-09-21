import {Inject, Injectable} from '@angular/core';
import {UiAsset} from '@sovity.de/edc-client';
import {AssetEditorDialogFormValue} from '../../routes/connector-ui/asset-page/asset-create-dialog/asset-editor-dialog-form-model';
import {ActiveFeatureSet} from '../config/active-feature-set';
import {APP_CONFIG, AppConfig} from '../config/app-config';
import {removeNullValues} from '../utils/record-utils';
import {trimmedOrNull} from '../utils/string-utils';
import {AssetProperties} from './asset-properties';
import {AdditionalAssetProperty, Asset} from './models/asset';

/**
 * Maps between EDC Asset and our type safe asset
 */
@Injectable({
  providedIn: 'root',
})
export class AssetPropertyMapper {
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private activeFeatureSet: ActiveFeatureSet,
  ) {}

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

      httpDatasourceHintsProxyMethod: this._parseBooleanFromString(
        props[AssetProperties.httpProxyMethod],
      ),
      httpDatasourceHintsProxyPath: this._parseBooleanFromString(
        props[AssetProperties.httpProxyPath],
      ),
      httpDatasourceHintsProxyQueryParams: this._parseBooleanFromString(
        props[AssetProperties.httpProxyQueryParams],
      ),
      httpDatasourceHintsProxyBody: this._parseBooleanFromString(
        props[AssetProperties.httpProxyBody],
      ),

      additionalProperties: this.buildAdditionalPropertiesforUiAsset(props),
    };
  }

  buildAsset(opts: {uiAsset: UiAsset; connectorEndpoint: string}): Asset {
    const {
      additionalProperties,
      additionalJsonProperties,
      privateProperties,
      privateJsonProperties,
      ...assetProperties
    } = opts.uiAsset;

    return {
      ...assetProperties,
      additionalProperties: this.convertToAdditionalProperties(opts.uiAsset),
      connectorEndpoint: opts.connectorEndpoint,
    };
  }

  convertToAdditionalProperties(asset: UiAsset): AdditionalAssetProperty[] {
    let result: AdditionalAssetProperty[] = [];
    type AssetKey =
      | 'additionalProperties'
      | 'additionalJsonProperties'
      | 'privateProperties'
      | 'privateJsonProperties';

    const propertiesToConvert: AssetKey[] = [
      'additionalProperties',
      'additionalJsonProperties',
      'privateProperties',
      'privateJsonProperties',
    ];

    for (let propName of propertiesToConvert) {
      const propValue = asset[propName as AssetKey];
      if (propValue) {
        for (let key in propValue) {
          result.push({key: key, value: propValue[key]});
        }
      }
    }

    return result;
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

  private _parseBooleanFromString(value: string | null): boolean | undefined {
    if (!value) {
      return undefined;
    }
    return value === 'true';
  }

  private _encodeBoolean(value?: boolean | null): string {
    return value ? 'true' : 'false';
  }
}
