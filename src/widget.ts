class Widget {
  configUrl: string;
  config: any;

  constructor(public me: HTMLScriptElement) {
    this.configUrl = me.getAttribute('data-config') || '/configurations/volunteer-opportunities.json';
  }

  async init() {
    const configResponse = await fetch(this.configUrl);
    this.config = await configResponse.json();
    const htmlResponse = await fetch(this.config.html);
    const html = await htmlResponse.text();
    this.me.insertAdjacentHTML('afterend', html);
  }
}

const me = document.currentScript;
window.addEventListener('DOMContentLoaded', async () => {
  const widget = new Widget(me as HTMLScriptElement);
  await widget.init();
});