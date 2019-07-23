import * as Crypto from 'crypto';
import { ComponentManager } from '../component-manager';

import * as $ from 'jquery';

export class BaseComponent<T> {
  config: T;
  uid: string = Crypto.randomBytes(8).toString('hex');
  element: JQuery<HTMLElement>;

  get componentType(): string {
    return this.constructor.name;
  }

  constructor(element: Element|JQuery<HTMLElement>, public componentManager: ComponentManager) {
    this.element = $(element) as JQuery<HTMLElement>;
    this.config = this.element.data(this.componentType.toLowerCase());
    this.element.data(this.componentType + '-uid', this.uid);
  }

  async init() {
    throw new Error('Component not setup properly')
  }
}