///<reference path="../../node_modules/@types/chrome/index.d.ts" />

chrome.contextMenus.create({
  title: "virhe",
  type: "normal",
  contexts: ["link"],
  onclick: onClick
});

class Program {
  channel: string;
  title: string;
  date: string;

  constructor(channel: string, title: string, date: string) {
    this.channel = channel;
    this.title = title;
    this.date = date;
  }

  command(): string {
    return `${this.channel} : ${this.title} : ${this.date}`
  }
}

function onClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void {
  const url = info.linkUrl;
  const xhr = new XHR();
  xhr.call(url);
}

function copyToClipboard(s: string): void {
  let textArea = document.createElement('textarea');
  document.body.appendChild(textArea);
  textArea.value = s;
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

class XHR {
  public call(url: string) {
    console.log(`URL: ${url}`);
    let xhr = new XMLHttpRequest();
    xhr.onload = this.programCallback;
    xhr.open("GET", url, true);
    xhr.responseType = "document";
  }

  private programCallback(ev: Event): void {
    console.log("callback");
    if (ev === null) {
      return
    }

    const resp = <XMLHttpRequest>ev.target;
    const doc = <XMLDocument>resp.responseXML;
    let title = doc.getElementsByClassName('yjM')[0].textContent;
    title = title.trim();
    let channel = doc.getElementsByClassName('yjS')[0].textContent;
    channel = channel.trim();
    let date = doc.getElementsByClassName('pt5p')[0].textContent;
    date = date.trim();

    const p = new Program(channel, title, date);
    copyToClipboard(p.command())
  }
}