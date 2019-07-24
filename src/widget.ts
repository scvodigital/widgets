import { Bristles } from 'bristles';

import { ComponentManager } from './component-manager';
import { NavigationManager } from './navigation-manager';

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
  componentManager = new ComponentManager([AjaxForm, DomManipulatorTrigger, MultiSelect, RemoteContent, Typeahead], this);
  navigationManager: NavigationManager;
  me: JQuery<HTMLElement>;
  baseElement = $('<div>');
  compiledTemplates: { [name: string]: (context: any) => any } = {};
  clock = window.requestAnimationFrame(this.tick.bind(this));

  constructor(me: HTMLScriptElement) {
    this.me = $(me);

    this.baseElement.addClass('scvo-widget');
    this.baseElement.html(`<div class="widget-loading">Loading, please wait...</div>`);
    this.baseElement.insertAfter(me);

    const url: string = this.me.data('url') || '/widgets/invalid-setup.html';
    this.navigationManager = new NavigationManager(this.baseElement, new URL(url), this);
  }

  render(template: string, context: any, name: string = '') {
    const compiledTemplate = this.compiledTemplates[name] || Bristles.compile(template);
    if (name !== '') {
      this.compiledTemplates[name] = compiledTemplate;
    }
    return compiledTemplate(context);
  }


  private updateRequested = false;
  requestUpdate() {
    this.updateRequested = true;
  }

  async tick() {
    window.cancelAnimationFrame(this.clock);

    if (this.updateRequested) {
      await this.componentManager.registerComponents();
      this.updateRequested = false;
    }

    this.clock = window.requestAnimationFrame(this.tick.bind(this));
  }
}

((me = document.currentScript) => {
  window.addEventListener('DOMContentLoaded', () => {
    new Widget(me as HTMLScriptElement);
  });
})();