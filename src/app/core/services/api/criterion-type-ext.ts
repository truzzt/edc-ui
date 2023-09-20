import {UiCriterionOperatorEnum} from '@sovity.de/edc-client';

export type UiCriterionOperator =
  | UiCriterionOperatorEnum
  | UiCriterionOperatorEnum;

export const CRITERION_OPERATOR_SYMBOLS: Record<UiCriterionOperator, string> = {
  EQ: '=',
  IN: 'in',
  LIKE: 'like',
};
