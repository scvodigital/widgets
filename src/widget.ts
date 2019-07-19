import { Components } from './components';
import { BaseComponent } from './components/base-component';

require('material-design-lite');
require('./widget.scss');

import * as $ from 'jquery';

(window as any).$ = $;

export class Widget {
  componentRegistry: ComponentRegistry = {};
  me: JQuery<HTMLElement>;
  baseElement = $('<div>');

  constructor(me: HTMLScriptElement) {
    this.me = $(me);
    const url: string|null = this.me.data('url') || '/widgets/invalid-setup.html';

    this.baseElement.addClass('scvo-widget');
    this.baseElement.html(`<div data-component="RemoteContent" data-config='{ "url": "${url}" }'></div>`);
    this.baseElement.insertAfter(me);
  }

  async registerComponents() {
    const componentElements = Array.from($('[data-component]')).map(item => $(item));
    for (const componentElement of componentElements) {
      const uid = componentElement.data('component-uid');
      if (uid) continue;

      const typeName = componentElement.data('component') || '';
      if (!Components.hasOwnProperty(typeName)) throw new Error('Invalid component name: ' + typeName);

      const type = Components[typeName] as typeof BaseComponent;
      const component = new type(componentElement, this);
      await component.init();
      this.componentRegistry[component.uid] = component;
      console.log('Component Registered', component);
    }
    componentHandler.upgradeDom();
  }
}

((me = document.currentScript) => {
  window.addEventListener('DOMContentLoaded', async () => {
    const widget = new Widget(me as HTMLScriptElement);
    await widget.registerComponents();
  });
})();

export interface ComponentRegistry {
  [element: string]: BaseComponent<any>;
}