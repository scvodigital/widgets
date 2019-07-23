import * as Querystring from 'querystring';

import { BaseComponent } from "./base-component";
import { DomManipulatorRules, DomManipulator } from "../dom-manipulator";

export class AjaxForm extends BaseComponent<AjaxFormConfig> {
  getContext(): AjaxFormContext {
    return {
      window,
      $,
      data: this.element.serialize(),
      instance: this,
    };
  }

  async init() {
    this.element.on('submit', this.submit.bind(this));
  }

  submit(event: JQuery.SubmitEvent) {
    event.preventDefault();
    if (this.config.onSubmitRules) {
      DomManipulator(this.config.onSubmitRules, this.element, this.getContext());
    }

    const ajaxSettings: JQueryAjaxSettings = {
      url: this.element.attr('action') || window.location.href,
      method: this.element.attr('method') || 'GET',
      data: Querystring.parse(this.element.serialize()),
      success: (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
        console.log('Success', response, status, xhr);
        if (this.config.onSuccessRules) {
          const context = this.getContext() as AjaxFormSuccessContext;
          context.xhr = xhr;
          context.response = response;
          context.status = status;
          DomManipulator(this.config.onSuccessRules, this.element, context);
        }
      },
      error: (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
        console.log('Error', xhr, status, error);
        if (this.config.onErrorRules) {
          const context = this.getContext() as AjaxFormErrorContext;
          context.xhr = xhr;
          context.status = status;
          context.error = error;
          DomManipulator(this.config.onSuccessRules, this.element, context);
        }
      }
    };

    if (ajaxSettings.method === 'GET') {
      const url = new URL(ajaxSettings.url || window.location.href);
      for (const param of this.element.serializeArray()) {
        url.searchParams.append(param.name, param.value);
      }
      ajaxSettings.url = url.href;
    }

    $.ajax(ajaxSettings);
  }
}

export interface AjaxFormConfig {
  onSubmitRules: DomManipulatorRules;
  onSuccessRules: DomManipulatorRules;
  onErrorRules: DomManipulatorRules;
}

export interface AjaxFormContext {
  instance: AjaxForm;
  window: Window;
  $: JQueryStatic;
  data: any;
}

export interface AjaxFormSuccessContext extends AjaxFormContext {
  xhr: JQuery.jqXHR;
  status: JQuery.Ajax.SuccessTextStatus;
  response: any;
}

export interface AjaxFormErrorContext extends AjaxFormContext {
  xhr: JQuery.jqXHR;
  status: JQuery.Ajax.ErrorTextStatus;
  error: string;
}