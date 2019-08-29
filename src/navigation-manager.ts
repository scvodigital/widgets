import * as Querystring from 'querystring';
import { Widget } from './widget';

export class NavigationManager {
  private isHashChange: boolean = true; //Set to true so on initial load location.hash isn't updated
  private _currentLocation: string|undefined;
  get currentLocation(): string {
    if (!this._currentLocation) {
      this._currentLocation = window.location.hash.substr(1);
    }
    return this._currentLocation;
  }
  set currentLocation(value: string) {
    this._currentLocation = value.startsWith('#') ? value.substr(1) : value;
  }

  constructor(public element: JQuery<HTMLElement>, public baseUrl: URL, public widget: Widget) {
    this.currentLocation = window.location.hash;
    //TODO: Remove all specific code from the widgets code base.
    //This should not be done like this. Metadata from a script tag should be made available
    //to templates so this can be done through configuration
    localStorage.setItem('tsi', widget.me.data('tsi'));
    localStorage.setItem('colorPrimary', widget.me.data('colour-primary'));
    localStorage.setItem('colorSecondary', widget.me.data('colour-secondary'));
    localStorage.setItem('disableMVA', widget.me.data('disable-mva'));
    window.addEventListener('hashchange', async () => {
      if (window.location.hash.substr(1) !== this.currentLocation) {
        this.isHashChange = true;
        await this.refresh();
      }
    });
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
        this.widget.baseElement.addClass('scvo-widget-loading');
        this.widget.loadingElement.show();

        const baseElementCoords = this.widget.baseElement.offset();
        const scrollTop = baseElementCoords ? baseElementCoords.top : 0;
        $('html, body').animate({
          scrollTop: scrollTop
        }, 400);

        const parsed = new URL(url, this.baseUrl);
        parsed.host = this.baseUrl.host;

        ajaxSettings = {
          dataType: 'html',
          beforeSend: function(jqXHR, settings){
            //TODO: Remove all specific code from the widgets code base.
            //This should not be done like this. Metadata from a script tag should be made available
            //to templates so this can be done through configuration
            if (localStorage.tsi !== 'undefined') jqXHR.setRequestHeader("widget-tsi", localStorage.tsi);
            if (localStorage.colorPrimary !== 'undefined') jqXHR.setRequestHeader("widget-color-primary", localStorage.colorPrimary);
            if (localStorage.colorSecondary !== 'undefined') jqXHR.setRequestHeader("widget-color-secondary", localStorage.colorSecondary);
            if (localStorage.disableMVA !== 'undefined') jqXHR.setRequestHeader("widget-disable-mva", localStorage.disableMVA);
          },
          method: method,
          complete: async () => {
            this.widget.baseElement.removeClass('scvo-widget-loading');
            this.widget.loadingElement.hide();
            this.currentLocation = parsed.href.substr(parsed.origin.length);
            if (!this.isHashChange) {
              window.location.hash = this.currentLocation;
            } else {
              this.isHashChange = false;
            }
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
        .then(() => {
          $.ajax(ajaxSettings);
        })
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