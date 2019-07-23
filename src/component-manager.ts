import { BaseComponent } from './components/base-component';

export class ComponentManager {
  components: { [name: string]: any } = {};
  componentRegistry: ComponentRegistry = {};

  constructor(components: any[]) {
    for (const component of components) {
      this.components[component.name] = component as typeof BaseComponent;
    }
  }

  async registerComponents() {
    const componentElements = Array.from($('[data-component]')).map(item => $(item));
    for (const componentElement of componentElements) {
      const typeNames = componentElement.data('component') || '';
      for (const typeName of typeNames.split(',')) {
        if (!this.components.hasOwnProperty(typeName)) throw new Error('Invalid component name: ' + typeName);

        const uid = componentElement.data(typeName + '-uid');
        if (uid) continue;

        const type = this.components[typeName] as typeof BaseComponent;
        const component = new type(componentElement, this);
        await component.init();
        this.componentRegistry[component.uid] = component;
        console.log('Component Registered', component);
      }
    }
    componentHandler.upgradeDom();
  }
}

export interface ComponentRegistry {
  [element: string]: BaseComponent<any>;
}