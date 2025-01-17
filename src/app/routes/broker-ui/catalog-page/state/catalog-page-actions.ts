import {CatalogPageSortingItem} from '@sovity.de/broker-server-client';
import {FilterValueSelectItem} from '../filter-value-select/filter-value-select-item';
import {CatalogActiveFilterPill} from './catalog-active-filter-pill';

export namespace CatalogPage {
  const tag = 'CatalogPage';

  export class Reset {
    static readonly type = `[${tag}] Reset`;
  }

  export class NeedFetch {
    static readonly type = `[${tag}] Data is out of date, need a fetch.`;
  }

  export class Fetch {
    static readonly type = `[${tag}] Actually fetch data.`;
  }

  export class UpdatePage {
    static readonly type = `[${tag}] Update the selected page`;

    constructor(public pageZeroBased: number) {}
  }

  export class UpdateSearchText {
    static readonly type = `[${tag}] Update the search bar's text`;

    constructor(public searchText: string) {}
  }

  export class UpdateSorting {
    static readonly type = `[${tag}] Update the selected sorting`;

    constructor(public sorting: CatalogPageSortingItem | null) {}
  }

  export class UpdateFilterSelectedItems {
    static readonly type = `[${tag}] Update a Filter's selected Items`;

    constructor(
      public filterId: string,
      public selectedItems: FilterValueSelectItem[],
    ) {}
  }

  export class UpdateFilterSearchText {
    static readonly type = `[${tag}] Update a Filter's search text`;

    constructor(public filterId: string, public searchText: string) {}
  }

  export class RemoveActiveFilterItem {
    static readonly type = `[${tag}] Remove an active filter from the chips below the search bar`;

    constructor(public item: CatalogActiveFilterPill) {}
  }
}
