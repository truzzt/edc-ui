import {ContractAgreementCard} from '@sovity.de/edc-client';
import {Asset} from '../../models/asset';

export type ContractAgreementCardMapped = Omit<
  ContractAgreementCard,
  'asset'
> & {
  asset: Asset;
  isInProgress: boolean;
  searchTargets: (string | null)[];
};
