import { BaseComponent } from './base-component';

export class RemoteContent extends BaseComponent<RemoteContentConfig> {
  async init() {
    const contentResponse = await fetch(this.config.url);
    const content = await contentResponse.text();
    this.element.html(content);
    setTimeout(async () => { await this.widget.registerComponents() }, 0);
  }
}

export interface RemoteContentConfig {
  url: string;
  method?: 'GET'|'POST';
  postBody?: any;
}