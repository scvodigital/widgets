import { Components } from './components';
import { BaseComponent } from './components/base-component';

require('../node_modules/material-design-lite/material');
require('./widget.scss');

export class Widget {
  componentRegistry: ComponentRegistry = {};
  baseElement: HTMLDivElement = document.createElement('div');

  constructor(public me: HTMLScriptElement) {
    const url: string|null = this.me.getAttribute('data-url') || '/widgets/invalid-setup.html';

    this.baseElement.classList.add('scvo-widget');
    this.baseElement.innerHTML = `<div data-component="RemoteContent" data-config='{ "url": "${url}" }'></div>`;
    me.insertAdjacentElement('afterend', this.baseElement);
  }

  async registerComponents() {
    const componentElements = Array.from(this.baseElement.querySelectorAll('[data-component]'));
    for (const componentElement of componentElements) {
      const uid = componentElement.getAttribute('data-component-uid');
      if (uid) continue;

      const typeName = componentElement.getAttribute('data-component') || '';
      if (!Components.hasOwnProperty(typeName)) throw new Error('Invalid component name: ' + typeName);

      const type = Components[typeName] as typeof BaseComponent;
      const component = new type(componentElement, this);
      await component.init();
      this.componentRegistry[component.uid] = component;
      console.log('Component Registered', component);
    }
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