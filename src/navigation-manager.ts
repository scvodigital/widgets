import * as Querystring from 'querystring';
import { Widget } from './widget';

export class NavigationManager {
  constructor(public element: JQuery<HTMLElement>, public baseUrl: URL, public widget: Widget) {
    window.addEventListener('hashchange', this.refresh.bind(this));
    this.refresh().then().catch(err => { console.error('Error refreshing', err); });
  }

  async refresh() {
    const url = window.location.hash ? window.location.hash.substr(1) : this.baseUrl.href;
    await this.navigate(url);
  }

  navigate(url: string, method: string = 'GET', data: any = {}, successCallback?: SuccessCallback, errorCallback?: ErrorCallback): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let ajaxSettings: JQueryAjaxSettings = {};

      try {
        const parsed = new URL(url, this.baseUrl);
        parsed.host = this.baseUrl.host;

        ajaxSettings = {
          dataType: 'html',
          method: method,
          complete: async () => {
            window.location.hash = parsed.href.substr(parsed.origin.length);
            this.widget.requestUpdate();
            resolve();
          },
          success: (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
            this.element.html(response.toString());
            if (successCallback) {
              successCallback(response, status, xhr);
            }
          },
          error: (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
            this.element.html(status);
            if (errorCallback) {
              errorCallback(xhr, status, error);
            }
          }
        };

        if (method === 'GET') {
          if (parsed.search) {
            const overrides = Querystring.parse(parsed.search.substr(1));
            Object.assign(data, overrides);
          }
          parsed.search = Querystring.stringify(data);
        } else {
          ajaxSettings.data = data;
        }

        ajaxSettings.url = parsed.href;
      } catch (err) {
        reject(err);
      }

      this.widget.componentManager.unregisterComponents()
        .then(_ => { $.ajax(ajaxSettings); })
        .catch(err => { console.error('Failed to unregister components', err); });
    });
  }
}

export interface SuccessCallback {
  (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR): void;
}

export interface ErrorCallback {
  (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string): void;
}