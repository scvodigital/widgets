import { ComponentManager } from './component-manager';

import { AjaxForm } from './components/ajax-form';
import { DomManipulatorTrigger } from './components/dom-manipulator-trigger';
import { MultiSelect } from './components/multi-select';
import { RemoteContent } from './components/remote-content';
import { Typeahead } from './components/typeahead';

require('material-design-lite');
require('./widget.scss');

import * as $ from 'jquery';

(window as any).$ = $;

export class Widget {
  componentManager = new ComponentManager([
    AjaxForm, DomManipulatorTrigger, MultiSelect, RemoteContent, Typeahead,
  ]);
  me: JQuery<HTMLElement>;
  baseElement = $('<div>');

  constructor(me: HTMLScriptElement) {
    this.me = $(me);
    const url: string|null = this.me.data('url') || '/widgets/invalid-setup.html';

    this.baseElement.addClass('scvo-widget');
    this.baseElement.html(`<div data-component="RemoteContent" data-RemoteContent='{ "url": "${url}" }'></div>`);
    this.baseElement.insertAfter(me);
  }
}

((me = document.currentScript) => {
  window.addEventListener('DOMContentLoaded', async () => {
    const widget = new Widget(me as HTMLScriptElement);
    await widget.componentManager.registerComponents();
  });
})();