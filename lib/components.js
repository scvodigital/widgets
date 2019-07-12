import { BaseComponent } from './components/base-component';
import { RemoteContent } from './components/remote-content';
export function ComponentsFactory(type, element, widget) {
    switch (type) {
        case ('RemoteContent'): return new RemoteContent(element, widget);
        default: return new BaseComponent(element, widget);
    }
}
//# sourceMappingURL=components.js.map