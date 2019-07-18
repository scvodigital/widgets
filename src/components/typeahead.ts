import { BaseComponent } from "./base-component";

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

  async init() {
    const typeaheadArgs: any[] = [this.config.typeaheadOptions || {}];
    this.config.datasets = this.config.datasets.filter(Boolean);
    for (const dataset of this.config.datasets) {
      const datumTokenizerField = dataset.bloodhound.datumTokenizerField;
      const bloodhoundOptions: any = {
        dataumTokenizer: datumTokenizerField ?
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
    }

    this.typeahead = (this.element as any).typeahead.apply(this.element, typeaheadArgs);
  }
}

export interface TypeaheadConfig {
  typeaheadOptions?: TypeaheadOptions;
  outputs: any[];
  datasets: TypeaheadDataset[];
  clearIfNothingSelected?: boolean;
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
  name?: string;
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
