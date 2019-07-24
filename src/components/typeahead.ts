import { BaseComponent } from "./base-component";
import { DomManipulator, DomManipulatorRules } from '../dom-utilities';

require('imports-loader?define=>false!typeahead.js/dist/typeahead.jquery.min.js');
const Bloodhound = require('imports-loader?define=>false!typeahead.js/dist/bloodhound.min.js');

export const BloodhoundTokenizers = {
  nonword: Bloodhound.tokenizers.nonword,
  whitespace: Bloodhound.tokenizers.whitespace,
  objNonword: Bloodhound.tokenizers.obj.nonword,
  objWhitespace: Bloodhound.tokenizers.obj.whitespace
}

export class Typeahead extends BaseComponent<TypeaheadConfig> {
  typeahead: any;
  selectedItem: any;
  autocompleted: boolean = false;
  datasets: { [name: string]: TypeaheadDataset } = {};
  textbox = this.element.find('input');

  async init() {
    this.setupTypeahead();
  }

  setupTypeahead() {
    const typeaheadArgs: any[] = [this.config.typeaheadOptions || {}];
    this.config.datasets = this.config.datasets.filter(Boolean);
    for (const dataset of this.config.datasets) {
      if (dataset.bloodhound.local) {
        for (const item of dataset.bloodhound.local) {
          item.datasetName = dataset.name;
        }
      }
      const datumTokenizerField = dataset.bloodhound.datumTokenizerField;
      const bloodhoundOptions: any = {
        datumTokenizer: datumTokenizerField ?
          BloodhoundTokenizers[dataset.bloodhound.datumTokenizer](datumTokenizerField) :
          BloodhoundTokenizers[dataset.bloodhound.datumTokenizer],
        queryTokenizer: BloodhoundTokenizers[dataset.bloodhound.queryTokenizer],
        local: dataset.bloodhound.local ? dataset.bloodhound.local.filter(Boolean) : [],
        initialize: dataset.bloodhound.hasOwnProperty('initialize') ? dataset.bloodhound.initialize : true,
        sufficient: dataset.bloodhound.sufficient || 5,
        prefetch: dataset.bloodhound.prefetch || undefined,
        remote: dataset.bloodhound.remote || undefined
      }

      const engine = new Bloodhound(bloodhoundOptions);

      dataset.source = engine;
      typeaheadArgs.push(dataset);
      this.datasets[dataset.name] = dataset;
    }

    this.typeahead = (this.textbox as any).typeahead.apply(this.textbox, typeaheadArgs);
    this.typeahead
      .on('typeahead:select', (ev: any, suggestion: any) => {
        this.autocompleted = true;
        this.typeaheadSelect(ev, suggestion);
      })
      .on('typeahead:autocomplete', (ev: any, suggestion: any) => {
        this.autocompleted = true;
        this.typeaheadSelect(ev, suggestion);
      })
      .on('keydown', (ev: any) => {
        switch (ev.keyCode) {
          case (9):
            if (this.autocompleted) ev.preventDefault();
            break;
          case (13):
            if (this.autocompleted) ev.preventDefault();
            break;
        }
        this.autocompleted = false;
      });
  }

  typeaheadSelect(event: any, suggestion: any) {
    if (this.config.itemSelectedRules) {
      const dataset = this.datasets[suggestion.datasetName] || null;
      const context = {
        event,
        suggestion,
        dataset,
        window,
        $,
        instance: this
      };
      DomManipulator(this.config.itemSelectedRules, this.element, context);
    }
  }
}

export interface TypeaheadConfig {
  typeaheadOptions?: TypeaheadOptions;
  itemSelectedRules?: DomManipulatorRules;
  datasets: TypeaheadDataset[];
}

export interface TypeaheadOptions {
  highlight?: boolean;
  hint?: boolean;
  minLength?: number;
  className?: TypeaheadClassNames;
}

export interface TypeaheadClassNames {
  input?: string;
  hint?: string;
  menu?: string;
  dataset?: string;
  suggestion?: string;
  empty?: string;
  open?: string;
  cursor?: string;
  highlight?: string;
}

export interface TypeaheadDataset {
  name: string;
  limit?: number;
  display?: string;
  templates?: TypeaheadDatasetTemplates;
  bloodhound: BloodhoundOptions;
  source?: any;
}

export interface TypeaheadDatasetTemplates {
  notFound?: string;
  pending?: string;
  header?: string;
  footer?: string;
  suggestion?: string;
}

export interface BloodhoundOptions {
  datumTokenizer: 'nonword'|'whitespace'|'objNonword'|'objWhitespace';
  datumTokenizerField: string;
  queryTokenizer: 'nonword'|'whitespace'|'objNonword'|'objWhitespace';
  initialize?: boolean;
  sufficient?: number;
  local?: any[];
  prefetch?: string|BloodhoundPrefetchOptions;
  remote?: string|BloodhoundRemoteOptions;
}

export interface BloodhoundPrefetchOptions {
  url: string;
  cache?: boolean;
  ttl?: number;
  cacheKey?: string;
  thumbprint?: string;
}

export interface BloodhoundRemoteOptions {
  url: string;
  wildcard?: string;
  rateLimitBy?: 'debounce'|'throttle';
  rateLimitWait?: number;
}
