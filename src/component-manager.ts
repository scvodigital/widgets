import { BaseComponent } from './components/base-component';
import { Widget } from './widget';

export class ComponentManager {
  components: { [name: string]: any } = {};
  componentRegistry: ComponentRegistry = {};

  constructor(components: any[], public widget: Widget) {
    for (const component of components) {
      this.components[component.name] = component as typeof BaseComponent;
    }
  }

  async registerComponents() {
    componentHandler.upgradeDom();
    const componentElements = Array.from($('[data-component]')).map(item => $(item));
    for (const componentElement of componentElements) {
      const typeNames = componentElement.data('component') || '';
      for (const typeName of typeNames.split(',')) {
        if (!this.components.hasOwnProperty(typeName)) throw new Error('Invalid component name: ' + typeName);

        const uid = componentElement.data(typeName + '-uid');
        if (uid) continue;

        const type = this.components[typeName] as typeof BaseComponent;
        const component = new type(componentElement, this.widget);
        await component.init();
        this.componentRegistry[component.uid] = component;
      }
    }
    componentHandler.upgradeDom();
  }

  mdlSelectorComponentMap = {
    '.mdl-js-button': 'MaterialButton',
    '.mdl-js-checkbox': 'MaterialCheckbox',
    '.mdl-js-data-table  ': 'MaterialDataTable',
    '.mdl-js-icon-toggle': 'MaterialIconToggle',
    '.mdl-js-layout': 'MaterialLayout',
    '.mdl-js-menu': 'MaterialMenu',
    '.mdl-js-progress': 'MaterialProgress',
    '.mdl-js-radio': 'MaterialRadio',
    '.mdl-js-slider': 'MaterialSlider',
    '.mdl-js-snackbar': 'MaterialSnackbar',
    '.mdl-js-spinner': 'MaterialSpinner',
    '.mdl-js-switch': 'MaterialSwitch',
    '.mdl-js-ripple-effect': 'MaterialRipple',
    '.mdl-js-tabs': 'MaterialTabs',
    '.mdl-tabs__tab': 'MaterialTab',
    '.mdl-layout__tab': 'MaterialLayoutTab',
    '.mdl-js-textfield': 'MaterialTextfield',
    '.mdl-tooltip': 'MaterialTooltip'
  }

  async unregisterComponents() {
    //TODO Destroy all components and MDL components
    for (const component of Object.values(this.componentRegistry)) {
      await component.destroy();
    }
    this.componentRegistry = {};

    for (const [selector, componentName] of Object.entries(this.mdlSelectorComponentMap)) {
      const elements = this.widget.baseElement.find(selector);
      elements.each((index, element) => {
        if (element.hasOwnProperty(componentName)) {
          componentHandler.downgradeElements(element);
        }
      });
    }

    // const mdlSelector = Object.keys(this.mdlSelectorComponentMap).join(', ');
    // const mdlElements = this.widget.baseElement.find(mdlSelector);
    // mdlElements.each((i, o) => {
    //   componentHandler.downgradeElements(o);
    // });
  }
}

export interface ComponentRegistry {
  [element: string]: BaseComponent<any>;
}