var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ComponentsFactory } from './components';
require('material-design-lite');
require('./widget.scss');
export class Widget {
    constructor(me) {
        this.me = me;
        this.componentRegistry = {};
        this.baseElement = document.createElement('div');
        this.baseElement.classList.add('scvo-widget');
        this.baseElement.innerHTML = '<p>Loading please wait...</p>';
        me.insertAdjacentElement('afterend', this.baseElement);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.me.getAttribute('data-url') || '/widgets/invalid-setup.html';
            const baseHtmlResponse = yield fetch(url);
            const baseHtml = yield baseHtmlResponse.text();
            this.baseElement.innerHTML = baseHtml;
            yield this.registerComponents();
        });
    }
    registerComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            const componentElements = Array.from(document.querySelectorAll('[data-component]'));
            for (const componentElement of componentElements) {
                const uid = componentElement.getAttribute('data-component-uid');
                if (uid)
                    continue;
                const typeName = componentElement.getAttribute('data-component') || '';
                const component = ComponentsFactory(typeName, componentElement, this);
                console.log(typeName, component);
            }
        });
    }
}
((me = document.currentScript) => {
    window.addEventListener('DOMContentLoaded', () => __awaiter(this, void 0, void 0, function* () {
        const widget = new Widget(me);
        yield widget.init();
    }));
})();
//# sourceMappingURL=widget.js.map