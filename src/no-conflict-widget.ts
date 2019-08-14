require('./widget-loading.scss');

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

  baseElement: HTMLIFrameElement;
  loadingElement: HTMLDivElement;
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

      .scvo-widget-loading-indicator {
        display: none !important;
      }
    </style>
  </head>
  <body>
    %SCRIPT_TAG%
    <script>
      var oldHeight = 0;
      var oldHash = window.location.hash;
      var oldLoading = null;

      var clock = window.requestAnimationFrame(tick);
      function tick() {
        window.cancelAnimationFrame(clock);

        checkHeight();
        checkHash();
        checkLoading();

        clock = window.requestAnimationFrame(tick);
      }

      function checkHeight() {
        var widgetElement = document.querySelector('.scvo-widget');
        if (widgetElement) {
          var newHeight = widgetElement.offsetHeight + 30;
          if (oldHeight !== newHeight) {
            var eventData = {
              event: 'height-change',
              data: newHeight
            }
            window.parent.postMessage(eventData, '%ORIGIN%');
            oldHeight = newHeight;
          }
        }
      }

      function checkHash() {
        var newHash = window.location.hash;
        if (oldHash !== newHash) {
          var eventData = {
            event: 'hash-change',
            data: newHash
          }
          window.parent.postMessage(eventData, '%ORIGIN%');
          oldHash = newHash;
        }
      }

      function checkLoading() {
        var widgetElement = document.querySelector('.scvo-widget');
        if (widgetElement) {
          var newLoading = widgetElement.classList.contains('scvo-widget-loading') ? 'loading' : 'not-loading';
          if (oldLoading !== newLoading) {
            var eventData = {
              event: 'loading-change',
              data: newLoading
            };
            window.parent.postMessage(eventData, '%ORIGIN%');
            oldLoading = newLoading;
          }
        }
      }
    </script>
  </body>
</html>`;

  constructor (private me: HTMLScriptElement) {
    this.baseElement = document.createElement('iframe');
    this.baseElement.setAttribute('border', '0');
    this.baseElement.style.margin = '0';
    this.baseElement.style.border = '0';
    this.baseElement.style.width = '100%';
    this.baseElement.style.height = '300px';
    this.me.insertAdjacentElement('afterend', this.baseElement);

    this.loadingElement = document.createElement('div');
    this.loadingElement.classList.add('scvo-widget-loading-indicator');
    this.me.insertAdjacentElement('afterend', this.loadingElement);

    window.addEventListener('message', this.handleMessage.bind(this), false);
    window.addEventListener('hashchange', this.handleHashChange.bind(this), false);

    const meTagHtml = this.me.outerHTML;
    const scriptTagHtml = meTagHtml.replace('no-conflict-', '');
    const frameHtml = this.htmlTemplate
      .replace(/%SCRIPT_TAG%/ig, scriptTagHtml)
      .replace(/%ORIGIN%/ig, location.origin);

    this.frameContentWindow = this.baseElement.contentWindow as Window;

    this.frameDocument = this.frameContentWindow.document;
    this.frameDocument.open();
    this.frameDocument.write(frameHtml);
    this.frameDocument.close();

    this.frameContentWindow.location.hash = window.location.hash.substr(1);
  }

  handleMessage(message: any) {
    if (message.source === this.frameContentWindow) {
      switch (message.data.event) {
        case ('hash-change'):
          console.log('Window message => Hash change:', message.data.data.substr(1));
          window.location.hash = message.data.data.substr(1);
          break;
        case ('height-change'):
          console.log('Window message => Height change:', message.data.data);
          this.baseElement.style.height = message.data.data + 'px';
          break;
        case ('loading-change'):
          console.log('Window message => Loading change:', message.data.data);
          if (message.data.data === 'loading') {
            this.loadingElement.style.display = 'block';
            const scrollTop = this.baseElement.offsetTop;
            window.scroll({
              top: scrollTop,
              left: 0,
              behavior: 'smooth'
            });
          } else {
            this.loadingElement.style.display = 'none';
          }
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