import {Injectable} from '@angular/core';
import {UiAsset} from '@sovity.de/edc-client';
import {AssetProperties} from './asset-properties';
import {AdditionalAssetProperty, Asset} from './models/asset';

/**
 * Maps between EDC Asset and our type safe asset
 */
@Injectable({
  providedIn: 'root',
})
export class AssetPropertyMapper {
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
      const propValue = asset[propName];
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

  private _parseBooleanFromString(value: string | null): boolean | undefined {
    if (!value) {
      return undefined;
    }
    return value === 'true';
  }
}
