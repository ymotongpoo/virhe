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
  startTime: Date;
  endTime: Date;
  duration: number;

  private channelMapping = {
    "NHK総合1・東京": "nhk",
    "NHKEテレ1東京": "etv",
    "日テレ1": "ntv",
    "TBS1": "tbs",
    "テレビ朝日": "ex",
    "フジテレビ": "cx",
    "TOKYO　MX1": "mx",
    "NHKBS1": "nhkbs1",
    "NHKBSプレミアム": "nhkbs2",
    "BS日テレ": "bsntv",
    "BS朝日1": "bsex",
    "BS-TBS": "bstbs",
    "BSジャパン": "bsjapan",
    "BSフジ・181": "bsfuji"
  }

  constructor(channel: string, title: string, date: string) {
    this.channel = channel;
    this.title = title;
    console.log(date);
    const dateRe = /([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日（\W）\s+([0-9]{1,2})時([0-9]{2})分～([0-9]{1,2})時([0-9]{2})分/
    const d = date.match(dateRe);
    // TODO(ymotongpoo): handle tv schedule over midnight. 
    this.startTime = new Date(`${d[1]}-${d[2]}-${d[3]} ${d[4]}:${d[5]}:00`);
    this.endTime = new Date((`${d[1]}-${d[2]}-${d[3]} ${d[6]}:${d[7]}:00`));
    this.duration = (this.endTime.getTime() - this.startTime.getTime()) / 60000;
  }

  command(): string {
    const startStr = this.getGopt3recTime();
    const channel = this.channelMapping[this.channel];
    return `gopt3rec book -title="${this.title}" -tv=${channel} -start=${startStr} -min=${this.duration}`
  }

  private getGopt3recTime(): string {
    const year = this.startTime.getFullYear();
    const month = this.startTime.getMonth() + 1;
    const day = this.startTime.getDate();

    let monthStr = month.toString();
    if (month < 10) {
      monthStr = "0" + month.toString();
    }
    let dayStr = day.toString();
    if (day < 10) {
      dayStr = "0" + day.toString();
    }
    return year.toString() + monthStr + dayStr;
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
    let xhr = new XMLHttpRequest();
    xhr.onload = this.programCallback;
    xhr.open("GET", url, true);
    xhr.responseType = "document";
    xhr.send();
  }

  private programCallback(ev: Event): void {
    if (ev === null) {
      return
    }

    const resp = <XMLHttpRequest>ev.target;
    const doc = <XMLDocument>resp.responseXML;

    // extract required TV program metadata
    let title = doc.getElementsByClassName('yjM')[0].textContent;
    title = title.trim();
    let channel = doc.getElementsByClassName('yjS')[0].textContent;
    channel = channel.trim();
    let dateLong = doc.getElementsByClassName('pt5p')[0];
    let date = dateLong.getElementsByTagName('em')[0].textContent;
    date = date.trim();

    const p = new Program(channel, title, date);
    copyToClipboard(p.command())
  }
}