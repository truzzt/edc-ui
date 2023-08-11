import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CatalogContractOffer} from '@sovity.de/broker-server-client';
import {ActiveFeatureSet} from '../../../core/config/active-feature-set';
import {Policy} from '../../../core/services/api/legacy-managent-api-client';
import {AssetProperties} from '../../../core/services/asset-properties';
import {Asset} from '../../../core/services/models/asset';
import {BrokerDataOffer} from '../../../routes/broker-ui/catalog-page/catalog-page/mapping/broker-data-offer';
import {
  ParameterizationDetailDialogComponent
} from '../../../routes/connector-ui/asset-page/parameterization-detail-dialog/parameterization-detail-dialog.component';
import {
  ParameterizationDetailDialogData,
  assetParameterizationDetail,
} from '../../../routes/connector-ui/asset-page/parameterization-detail-dialog/parameterization-detail-dialog.data';
import {
  ContractAgreementCardMapped
} from '../../../routes/connector-ui/contract-agreement-page/contract-agreement-cards/contract-agreement-card-mapped';
import {JsonDialogComponent} from '../../json-dialog/json-dialog/json-dialog.component';
import {JsonDialogData} from '../../json-dialog/json-dialog/json-dialog.data';
import {PropertyGridGroup} from '../../property-grid/property-grid-group/property-grid-group';
import {PropertyGridField} from '../../property-grid/property-grid/property-grid-field';
import {PropertyGridFieldService} from '../../property-grid/property-grid/property-grid-field.service';
import {formatDateAgo} from '../../ui-elements/ago/formatDateAgo';
import {
  getOnlineStatusColor,
  getOnlineStatusIcon,
} from '../icon-with-online-status/online-status-utils';
import {getLegacyPolicy} from './policy-utils';


@Injectable()
export class AssetPropertyGridGroupBuilder {
  constructor(
    private matDialog: MatDialog,
    private activeFeatureSet: ActiveFeatureSet,
    private propertyGridUtils: PropertyGridFieldService,
  ) {
  }

  buildAssetPropertiesGroup(
    asset: Asset,
    groupLabel: string | null,
  ): PropertyGridGroup {
    const fields: PropertyGridField[] = [
      {
        icon: 'category',
        label: 'ID',
        labelTitle: AssetProperties.id,
        ...this.propertyGridUtils.guessValue(asset.id),
      },
      {
        icon: 'file_copy',
        label: 'Version',
        labelTitle: AssetProperties.version,
        ...this.propertyGridUtils.guessValue(asset.version),
      },
      {
        icon: 'language',
        label: 'Language',
        labelTitle: AssetProperties.language,
        ...this.propertyGridUtils.guessValue(asset.language?.label),
      },
      {
        icon: 'apartment',
        label: 'Publisher',
        labelTitle: AssetProperties.publisher,
        ...this.propertyGridUtils.guessValue(asset.publisher),
      },
      {
        icon: 'bookmarks',
        label: 'Endpoint Documentation',
        labelTitle: AssetProperties.endpointDocumentation,
        ...this.propertyGridUtils.guessValue(asset.endpointDocumentation),
      },
      {
        icon: 'gavel',
        label: 'Standard License',
        labelTitle: AssetProperties.standardLicense,
        ...this.propertyGridUtils.guessValue(asset.standardLicense),
      },
      this.buildConnectorEndpointField(asset.originator!!),
      {
        icon: 'account_circle',
        label: 'Organization',
        labelTitle: AssetProperties.originatorOrganization,
        ...this.propertyGridUtils.guessValue(asset.originatorOrganization),
      },
      {
        icon: 'category',
        label: 'Content Type',
        labelTitle: AssetProperties.contentType,
        ...this.propertyGridUtils.guessValue(asset.contentType),
      },
    ];

    if (this.activeFeatureSet.hasMdsFields()) {
      fields.push(...this.buildMdsProperties(asset, true));
    }

    if (
      asset.httpProxyMethod != null ||
      asset.httpProxyBody != null ||
      asset.httpProxyPath != null ||
      asset.httpProxyQueryParams != null
    ) {
      this.addParametrizationFields(asset, fields);
    }

    return {
      groupLabel,
      properties: fields,
    };
  }

  private addParametrizationFields(asset: Asset, fields: PropertyGridField[]) {
    let showDetailsObject = {
      httpProxyMethod: asset.httpProxyMethod ? 'Enabled' : 'Disabled',
      httpProxyBody: asset.httpProxyBody ? 'Enabled' : 'Disabled',
      httpProxyPath: asset.httpProxyPath ? 'Enabled' : 'Disabled',
      httpProxiedQueryParams: asset.httpProxyQueryParams
        ? 'Enabled'
        : 'Disabled',
    };

    fields.push({
      icon: 'list',
      label: 'Parameterization Options',
      text: 'Show Details',
      onclick: () =>
        this.onShowDetailsClick(
          `Parameterization Options`,
          asset.name,
          'list',
          showDetailsObject,
        ),
    });
  }

  buildAdditionalPropertiesGroup(asset: Asset): PropertyGridGroup {
    const fields: PropertyGridField[] = [];

    if (!this.activeFeatureSet.hasMdsFields()) {
      fields.push(...this.buildMdsProperties(asset, false));
    }

    fields.push(
      ...asset.additionalProperties.map((prop) => {
        return {
          icon: 'category ',
          label: prop.key,
          labelTitle: prop.key,
          ...this.propertyGridUtils.guessValue(prop.value),
        };
      }),
    );

    return {
      groupLabel: 'Additional Properties',
      properties: fields,
    };
  }

  buildMdsProperties(asset: Asset, includeEmpty: boolean): PropertyGridField[] {
    const fields: PropertyGridField[] = [];
    if (includeEmpty || asset.transportMode) {
      fields.push({
        icon: 'commute',
        label: 'Transport Mode',
        labelTitle: AssetProperties.transportMode,
        ...this.propertyGridUtils.guessValue(asset.transportMode?.label),
      });
    }
    if (includeEmpty || asset.dataCategory) {
      fields.push({
        icon: 'commute',
        label: 'Data Category',
        labelTitle: AssetProperties.dataCategory,
        ...this.propertyGridUtils.guessValue(asset.dataCategory?.label),
      });
    }
    if (includeEmpty || asset.dataSubcategory) {
      fields.push({
        icon: 'commute',
        label: 'Data Subcategory',
        labelTitle: AssetProperties.dataSubcategory,
        ...this.propertyGridUtils.guessValue(asset.dataSubcategory?.label),
      });
    }
    if (includeEmpty || asset.dataModel) {
      fields.push({
        icon: 'category',
        label: 'Data Model',
        labelTitle: AssetProperties.dataModel,
        ...this.propertyGridUtils.guessValue(asset.dataModel),
      });
    }
    if (includeEmpty || asset.geoReferenceMethod) {
      fields.push({
        icon: 'commute',
        label: 'Geo Reference Method',
        labelTitle: AssetProperties.geoReferenceMethod,
        ...this.propertyGridUtils.guessValue(asset.geoReferenceMethod),
      });
    }
    return fields;
  }

  onShowPolicyDetailsClick(
    title: string,
    subtitle: string,
    policyDetails: Policy,
  ) {
    const data: JsonDialogData = {
      title,
      subtitle,
      icon: 'policy',
      objectForJson: policyDetails,
    };
    this.matDialog.open(JsonDialogComponent, {data});
  }

  onShowDetailsClick(
    title: string,
    subtitle: string,
    icon: string,
    details: assetParameterizationDetail,
  ) {
    const data: ParameterizationDetailDialogData = {
      title,
      subtitle,
      icon,
      objectForDetailDialog: details,
    };
    this.matDialog.open(ParameterizationDetailDialogComponent, {data});
  }

  buildContractOfferGroup(
    asset: Asset,
    contractOffer: CatalogContractOffer,
    i: number,
    total: number,
  ) {
    const groupLabel = `Contract Offer ${total > 1 ? i + 1 : ''}`;
    let properties: PropertyGridField[] = [
      {
        icon: 'policy',
        label: 'Contract Policy',
        text: 'Show Policy Details',
        onclick: () =>
          this.onShowPolicyDetailsClick(
            `${groupLabel} Contract Policy)`,
            asset.name,
            getLegacyPolicy(contractOffer.contractPolicy),
          ),
      },
      {
        icon: 'category',
        label: 'Contract Offer ID',
        ...this.propertyGridUtils.guessValue(contractOffer.contractOfferId),
      },
      {
        icon: 'category',
        label: 'Created At',
        ...this.propertyGridUtils.guessValue(
          this.propertyGridUtils.formatDate(contractOffer.createdAt),
        ),
      },
    ];
    return {groupLabel, properties};
  }

  buildPolicyGroup(
    asset: Asset,
    contractPolicy: Policy | null,
    groupLabel: string = 'Policies',
  ) {
    let properties: PropertyGridField[] = [];
    if (contractPolicy) {
      properties.push(
        this.buildContractPolicyField(contractPolicy, asset.name),
      );
    }
    return {groupLabel, properties};
  }

  buildContractPolicyField(contractPolicy: Policy, subtitle: string) {
    return {
      icon: 'policy',
      label: 'Contract Policy',
      text: 'Show Policy Details',
      onclick: () =>
        this.onShowPolicyDetailsClick(
          'Contract Policy',
          subtitle,
          contractPolicy,
        ),
    };
  }

  buildContractAgreementGroup(contractAgreement: ContractAgreementCardMapped) {
    let properties: PropertyGridField[] = [
      {
        icon: 'category',
        label: 'Signed',
        ...this.propertyGridUtils.guessValue(
          this.propertyGridUtils.formatDate(
            contractAgreement.contractSigningDate,
          ),
        ),
      },
      {
        icon: 'category',
        label: 'Valid From',
        ...this.propertyGridUtils.guessValue(
          this.propertyGridUtils.formatDate(
            contractAgreement.contractStartDate,
          ),
        ),
      },
      {
        icon: 'category',
        label: 'Valid To',
        ...this.propertyGridUtils.guessValue(
          this.propertyGridUtils.formatDate(contractAgreement.contractEndDate),
        ),
      },
      {
        icon: 'policy',
        label: 'Direction',
        ...this.propertyGridUtils.guessValue(contractAgreement.direction),
      },
      {
        icon: 'link',
        label: 'Other Connector Endpoint',
        ...this.propertyGridUtils.guessValue(
          contractAgreement.counterPartyAddress,
        ),
      },
      {
        icon: 'link',
        label: 'Other Connector ID',
        ...this.propertyGridUtils.guessValue(contractAgreement.counterPartyId),
      },
      {
        icon: 'category',
        label: 'Contract Agreement ID',
        ...this.propertyGridUtils.guessValue(
          contractAgreement.contractAgreementId,
        ),
      },
    ];

    if (contractAgreement.isConsumingLimitsEnforced) {
      properties.push({
        icon: contractAgreement.canTransfer ? 'sync' : 'sync_disabled',
        label: 'Status',
        tooltip: contractAgreement.statusTooltipText,
        textIconAfter: contractAgreement.statusTooltipText ? 'help' : null,
        text: contractAgreement.statusText,
        additionalClasses: contractAgreement.canTransfer ? '' : 'text-warn',
      });
    }

    return {
      groupLabel: 'Contract Agreement',
      properties,
    };
  }

  buildBrokerDataOfferGroup(dataOffer: BrokerDataOffer): PropertyGridGroup {
    const lastUpdate = formatDateAgo(
      dataOffer.connectorOfflineSinceOrLastUpdatedAt,
    );
    return {
      groupLabel: null,
      properties: [
        {
          icon: 'today',
          label: 'Updated At',
          ...this.propertyGridUtils.guessValue(
            this.propertyGridUtils.formatDate(dataOffer.updatedAt),
          ),
        },
        {
          ...this.buildConnectorEndpointField(dataOffer.connectorEndpoint),
          copyButton: true,
        },
        {
          icon: getOnlineStatusIcon(dataOffer.connectorOnlineStatus),
          label: 'Status',
          labelTitle: `Last updated ${lastUpdate}`,
          text:
            dataOffer.connectorOnlineStatus == 'ONLINE'
              ? `Online`
              : `Offline since ${lastUpdate}`,
          additionalClasses: getOnlineStatusColor(
            dataOffer.connectorOnlineStatus,
          ),
          additionalIconClasses: getOnlineStatusColor(
            dataOffer.connectorOnlineStatus,
          ),
        },
      ],
    };
  }

  buildConnectorEndpointField(endpoint: string): PropertyGridField {
    return {
      icon: 'link',
      label: 'Connector Endpoint',
      labelTitle: AssetProperties.originator,
      ...this.propertyGridUtils.guessValue(endpoint),
    };
  }
}
