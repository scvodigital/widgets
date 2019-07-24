import * as Querystring from 'querystring';

const objectPathCache: { [path: string]: Function } = {};

export function DomReader(rules: DomReaderRules, root: JQuery<HTMLElement>): any {
  const output: any = {};

  for (const [name, rule] of Object.entries(rules)) {
    let value: undefined|any;
    if (rule.selector === 'window') {
      value = objectPath(window, rule.attribute)
    } else {
      const elements =
        rule.selector === '>' ? root :
        rule.selector.startsWith('>') ? root.find(rule.selector.substr(1)) :
        rule.selector === '<' ? root.parent() :
        rule.selector.startsWith('<') ? root.parents(rule.selector.substr(1)) :
        $(rule.selector);

      if (elements.length === 0) continue;

      switch (rule.attribute) {
        case ('$serializedObject'):
          value = Querystring.parse(elements.serialize());
          break;
        case ('$serializedQuerystring'):
          value = elements.serialize();
          break;
        case ('$html'):
          value = elements.html();
          break;
        case ('$text'):
          value = elements.text();
          break;
        default:
          value = elements.attr(rule.attribute);
      }
    }

    if (typeof value !== 'undefined') {
      if (Array.isArray(value) && !rule.array) {
        output[name] = value[0];
      } else {
        output[name] = value;
      }
    } else if (rule.default) {
      output[name] = rule.default;
    }
  }

  return output;

  function objectPath(obj: any, path: string) {
    if (!objectPathCache.hasOwnProperty(path)) {
      objectPathCache[path] = new Function("obj", "return obj." + path + ";");
    }
    const resolved = objectPathCache[path](obj);
    return resolved;
  }
}

export interface DomReaderRules {
  [name: string]: {
    selector: string;
    attribute: string;
    default?: string;
    array?: boolean;
  }
}