import {
  AssetPage,
  IdResponseDto,
  UiAsset,
  UiAssetCreateRequest,
} from '@sovity.de/edc-client';
import {AssetProperties} from '../../asset-properties';
import {TestAssets} from './data/test-assets';

export let assets: UiAsset[] = [TestAssets.full, TestAssets.boring];

export const assetPage = (): AssetPage => {
  return {
    assets,
  };
};

export const createAsset = (asset: UiAssetCreateRequest): IdResponseDto => {
  assets.push({
    assetId: asset.assetId,

    properties: asset.properties,
    privateProperties: asset.privateProperties,
  });
  return {
    id: asset.properties[AssetProperties.id],
    lastUpdatedDate: new Date(),
  };
};

export const deleteAsset = (id: string): IdResponseDto => {
  assets = assets.filter((it) => it.properties[AssetProperties.id] !== id);
  return {id, lastUpdatedDate: new Date()};
};
