import {AssetDto, AssetEntry, UiAsset} from '@sovity.de/edc-client';
import {AssetProperties} from '../../../asset-properties';

export namespace TestAssets {
  export const boring: UiAsset = {
    properties: {
      [AssetProperties.id]: 'test-asset-1',
      [AssetProperties.name]: 'Test Asset 1',
      [AssetProperties.description]: 'This is a test asset.',
    },
    privateProperties: {
      'some-private-property': 'abc',
    },
  };

  export const full: UiAsset = {
    [AssetProperties.id]: 'urn:artifact:my-test-asset-4',
    [AssetProperties.name]: 'Rail Network 2023 NRW - RailDesigner Export',
    [AssetProperties.version]: '1.1',
    [AssetProperties.originatorOrganization]: 'Deutsche Bahn AG',
    [AssetProperties.keywords]: 'db, bahn, rail, Rail-Designer',
    [AssetProperties.contentType]: 'application/json',
    [AssetProperties.description]:
      'Train Network Map released on 10.01.2023, valid until 31.02.2023. \nFile format is xyz as exported by Rail-Designer.',
    [AssetProperties.language]: 'https://w3id.org/idsa/code/EN',
    [AssetProperties.publisher]: 'https://my.cool-api.gg/about',
    [AssetProperties.standardLicense]: 'https://my.cool-api.gg/license',
    [AssetProperties.endpointDocumentation]: 'https://my.cool-api.gg/docs',
    [AssetProperties.dataCategory]: 'Infrastructure and Logistics',
    [AssetProperties.dataSubcategory]:
      'General Information About Planning Of Routes',
    [AssetProperties.dataModel]: 'my-data-model-001',
    [AssetProperties.geoReferenceMethod]: 'my-geo-reference-method',
    [AssetProperties.transportMode]: 'Rail',
    additionalProperties: {},
    privateProperties: {},
  };

  export function toAssetDto(entry: UiAsset): AssetDto {
    return {
      assetId: entry.assetId,
      createdAt: new Date(),
      properties: entry.properties,
    };
  }

  export function toDummyAsset(entry: UiAsset): UiAsset {
    return dummyAsset(entry.assetId[AssetProperties.id]);
  }

  export function dummyAsset(assetId: string): UiAsset {
    return {
      properties: {
        [AssetProperties.id]: assetId,
      },
      privateProperties: {},
    };
  }
}
