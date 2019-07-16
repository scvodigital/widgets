import { BaseComponent } from './base-component';
import { Widget } from '../widget';

export class MultiSelect extends BaseComponent<MultiSelectConfig> {
  checkboxElements: HTMLInputElement[] = [];
  menuItemElements: HTMLLIElement[] = [];
  selectedLabelElement: HTMLElement;
  selectedCountElement: HTMLElement;
  menuElement: HTMLElement;
  buttonElement: HTMLElement;
  materialMenu: any;

  constructor(element: Element, widget: Widget) {
    super(element, widget)
    this.checkboxElements = Array.from(this.element.querySelectorAll('.mdl-checkbox__input'));
    this.menuItemElements = Array.from(this.element.querySelectorAll('.mdl-list__item'));
    this.selectedLabelElement = this.element.querySelector('.multi-select-selected') as HTMLElement;
    this.selectedCountElement = this.element.querySelector('.multi-select-count') as HTMLElement;
    this.menuElement = this.element.querySelector('.mdl-menu') as HTMLElement;
    this.buttonElement = this.element.querySelector('#' + this.menuElement.getAttribute('for')) as HTMLElement;
  }

  async init() {
    this.buttonElement.addEventListener('click', () => {
      this.menuElement.scrollTo({ left: 0, top: 0 });
    });

    for (const checkbox of this.checkboxElements) {
      checkbox.addEventListener('change', (evt: Event) => {
        console.log('Checkbox changed', evt);
        this.updateSelectedLabel();
      });
    }

    for (const menuItem of this.menuItemElements) {
      menuItem.addEventListener('click', (evt: Event) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.cancelBubble = false;
        const checkbox: any = (menuItem.querySelector('.mdl-checkbox') as any).MaterialCheckbox;
        const checkboxElement = menuItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkboxElement) {
          if (checkboxElement.checked) {
            checkbox.uncheck();
          } else {
            checkbox.check();
          }
          this.updateSelectedLabel();
        }
      });
    }

    setTimeout(() => {
      componentHandler.upgradeDom("MaterialCheckbox", 'mdl-checkbox');
      componentHandler.upgradeDom("MaterialRipple", 'mdl-js-ripple-effect');
      componentHandler.upgradeDom("MaterialMenu", 'mdl-js-menu');

      this.materialMenu = (this.menuElement as any).MaterialMenu;

      const menuWidth = this.menuElement.getBoundingClientRect().width;
      this.menuElement.style.width = (menuWidth + 100) + 'px';

      this.menuElement.addEventListener('click', (evt: Event) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.cancelBubble = false;
      });
    }, 0);

    this.updateSelectedLabel();
  }

  updateSelectedLabel() {
    const selected: string[] = [];
    for (const checkbox of this.checkboxElements) {
      const labelElement = this.element.querySelector('.mdl-list__item[for="' + checkbox.id + '"] .mdl-list__item-primary-content');
      const label = labelElement ? labelElement.innerHTML : checkbox.value;
      if (checkbox.checked) {
        selected.push(label.trim());
      }
    }
    if (selected.length > 0) {
      if (this.selectedLabelElement) {
        this.selectedLabelElement.innerHTML = selected.join(', ');
      }
      if (this.selectedCountElement) {
        this.selectedCountElement.innerHTML = `(${selected.length} selected)`
      }
    } else {
      if (this.selectedLabelElement) {
        this.selectedLabelElement.innerHTML = 'None';
      }
      if (this.selectedCountElement) {
        this.selectedCountElement.innerHTML = `(None selected)`
      }
    }
  }
}

export interface MultiSelectConfig {
  labelItemCount: number;
}