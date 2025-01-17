// @ts-nocheck

/**
 * EDC REST API
 * All files merged by open api merger
 *
 * The version of the OpenAPI document: 1.0.0-SNAPSHOT
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import {Asset} from './asset';
import {Policy} from './policy';

export interface ContractOffer {
  asset?: Asset;
  assetId?: string;
  consumer?: string;
  contractEnd?: string;
  contractStart?: string;
  id?: string;
  offerEnd?: string;
  offerStart?: string;
  policy?: Policy;
  provider?: string;
}
