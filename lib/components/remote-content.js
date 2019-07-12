var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseComponent } from './base-component';
export class RemoteContent extends BaseComponent {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const contentResponse = yield fetch(this.config.url);
            const content = yield contentResponse.text();
            this.element.innerHTML = content;
        });
    }
}
//# sourceMappingURL=remote-content.js.map