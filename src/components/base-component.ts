import * as Crypto from 'crypto';
import { Widget } from '../widget';

import * as $ from 'jquery';

export class BaseComponent<T> {
  config: T;
  uid: string = Crypto.randomBytes(8).toString('hex');
  element: JQuery<HTMLElement>;

  constructor(element: Element|JQuery<HTMLElement>, public widget: Widget) {
    this.element = $(element) as JQuery<HTMLElement>;
    this.config = this.element.data('config');
    this.element.data('component-uid', this.uid);
  }

  async init() {
    throw new Error('Component not setup properly')
  }
}