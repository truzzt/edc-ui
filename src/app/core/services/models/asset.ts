import {UiAsset} from '@sovity.de/edc-client';

/**
 * Asset (UI Dto / Type Safe)
 *
 * Also includes full items / labels for fixed vocabulary values, e.g. language
 */
export type Asset = Omit<
  UiAsset,
  | 'additionalProperties'
  | 'additionalJsonProperties'
  | 'privateProperties'
  | 'privateJsonProperties'
> & {
  connectorEndpoint: string;
  // Unhandled Additional Properties
  additionalProperties: AdditionalAssetProperty[];
};

export interface AdditionalAssetProperty {
  key: string;
  value: string;
}
