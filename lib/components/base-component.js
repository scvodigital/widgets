var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Crypto from 'crypto';
export class BaseComponent {
    constructor(element, widget) {
        this.element = element;
        this.widget = widget;
        this.isSetup = false;
        this.uid = Crypto.randomBytes(8).toString('hex');
        const config = element.getAttribute('data-config');
        if (!config)
            throw new Error('Invalid component');
        this.config = JSON.parse(config);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setup();
            this.element.setAttribute('data-component-uid', this.uid);
            this.widget.componentRegistry[this.uid] = this;
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () { throw new Error('Component not setup properly'); });
    }
}
//# sourceMappingURL=base-component.js.map