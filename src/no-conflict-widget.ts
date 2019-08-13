import * as $ from 'jquery';
(window as any).$ = $;

export class NoConflictWidget {
  private _currentLocation: string|undefined;
  get currentLocation(): string {
    if (!this._currentLocation) {
      this._currentLocation = window.location.hash.substr(1);
    }
    return this._currentLocation;
  }
  set currentLocation(value: string) {
    this._currentLocation = value.startsWith('#') ? value.substr(1) : value;
  }

  me: JQuery<HTMLElement>;
  baseElement: JQuery<HTMLElement>;
  frameContentWindow: Window;
  frameDocument: Document;
  htmlTemplate = `<!doctype html>
<html lang="en">
  <head prefix="og: http://ogp.me/ns#">
    <title>SCVO Widgets</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    %SCRIPT_TAG%
    <script>
      window.addEventListener('hashchange', function() {
        window.parent.postMessage({ event: 'hashchange', data: window.location.hash }, '%ORIGIN%');
      });

      var oldHeight = 0;
      var clock = window.requestAnimationFrame(tick);
      function tick() {
        window.cancelAnimationFrame(clock);

        var body = document.body, html = document.documentElement;
        var newHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        if (oldHeight !== newHeight) {
          window.parent.postMessage({ event: 'resized', data: newHeight });
          oldHeight = newHeight;
        }

        clock = window.requestAnimationFrame(tick);
      }

    </script>
  </body>
</html>`;

  constructor (me: HTMLScriptElement) {
    this.me = $(me);
    this.baseElement = $('<iframe>')
      .attr('border', '0')
      .css({
        'margin': '0',
        'border': '0',
        'width': '100%',
        'height': '300px'
      })
      .insertAfter(this.me);

    window.addEventListener('message', this.handleMessage.bind(this), false);
    window.addEventListener('hashchange', this.handleHashChange.bind(this), false);

    const meTagHtml = this.me[0].outerHTML;
    const scriptTagHtml = meTagHtml.replace('no-conflict-', '');
    const frameHtml = this.htmlTemplate
      .replace(/%SCRIPT_TAG%/ig, scriptTagHtml)
      .replace(/%ORIGIN%/ig, location.origin);

    this.frameContentWindow = (this.baseElement[0] as HTMLIFrameElement).contentWindow as Window;

    this.frameDocument = this.frameContentWindow.document;
    this.frameDocument.open();
    this.frameDocument.write(frameHtml);
    this.frameDocument.close();

    this.frameContentWindow.location.hash = window.location.hash.substr(1);
  }

  handleMessage(message: any) {
    if (message.source === this.frameContentWindow) {
      switch (message.data.event) {
        case ('hashchange'):
          console.log('Window message => Hash change:', message.data.data.substr(1));
          window.location.hash = message.data.data.substr(1);
          break;
        case ('resized'):
          console.log('Window message => Frame resize:', message.data.data);
          this.baseElement.css('height', message.data.data);
          break;
        case ('navigationStart'):
          console.log('Window message => Navigation start:', message.data.data);
          this.baseElement.css('height', '100vh');
          break;
        case ('navigationEnd'):
          console.log('Window message => Navigation end:', message.data.data);
          break;
        default:
          console.log('Unknown event:', message.data);
      }
    }
  }

  handleHashChange(event: any) {
    if (window.location.hash.substr(1) !== this.currentLocation) {
      console.log('Parent hash change => Hash actually changed', window.location.hash.substr(1));
      this.frameContentWindow.location.hash = window.location.hash.substr(1);
    }
  }
}

((me = document.currentScript) => {
  window.addEventListener('DOMContentLoaded', () => {
    new NoConflictWidget(me as HTMLScriptElement);
  });
})();