import { BaseComponent } from './base-component';
import { DomReaderRules, DomReader } from '../dom-reader';

export class RemoteContent extends BaseComponent<RemoteContentConfig> {
  get templateContext(): any {
    const context = {
      window,
      data: {},
      instance: this
    };

    if (this.config.domReaderRules) {
      context.data = DomReader(this.config.domReaderRules, this.element);
    }

    return context;
  }

  async init() {
    await this.load();
  }

  async load() {
    const contentResponse = await fetch(this.config.url);
    const content = await contentResponse.text();
    this.element.html(content);
    this.widget.requestUpdate();
  }
}

export interface RemoteContentConfig {
  url: string;
  method?: 'GET'|'POST';
  postBody?: any;
  domReaderRules?: DomReaderRules;
}