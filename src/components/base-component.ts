import * as Crypto from 'crypto';
import { Widget } from '../widget';

export class BaseComponent<T> {
  config: T;
  uid: string = Crypto.randomBytes(8).toString('hex');

  constructor(public element: Element, public widget: Widget) {
    const config = element.getAttribute('data-config');
    if (!config) throw new Error('Invalid configuration');
    this.config = JSON.parse(config) as T;
    this.element.setAttribute('data-component-uid', this.uid);
  }

  async init() {
    throw new Error('Component not setup properly')
  }
}