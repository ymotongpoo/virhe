//    Copyright 2016 Yoshi Yamaguchi
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

/// <reference path="../../node_modules/@types/chrome/index.d.ts" />
/// <reference path="../../node_modules/moment/moment.d.ts" />

import * as moment from 'moment';

chrome.contextMenus.create({
  title: "virhe",
  type: "normal",
  contexts: ["link"],
  onclick: onClick
});

class Program {
  channel: string;
  title: string;
  startTime: moment.Moment;
  endTime: moment.Moment;
  duration: number;

  private channelMapping = {
    "NHK総合1・東京": "nhk",
    "NHKEテレ1東京": "etv",
    "日テレ1": "ntv",
    "TBS1": "tbs",
    "テレビ朝日": "ex",
    "フジテレビ": "cx",
    "テレビ東京1": "tx",
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
    const dateRe = /([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日（\W）\s+([0-9]{1,2})時([0-9]{2})分～([0-9]{1,2})時([0-9]{2})分/
    const d = date.match(dateRe);
    // TODO(ymotongpoo): handle tv schedule over midnight.
    let startHour = Number(d[4]);
    let endHour = Number(d[6]);
    let startOverMidnight = false;
    let endOverMidnight = false;
    if (startHour >= 24) {
      startHour = startHour - 24
      startOverMidnight = true
    }
    if (endHour >= 24) {
      endHour = endHour - 24
      endOverMidnight = true;
    }

    this.startTime = moment(new Date(`${d[1]}-${d[2]}-${d[3]} ${startHour}:${d[5]}:00`));
    if (startOverMidnight) {
      this.startTime = this.startTime.add(1, "days");
    }
    this.endTime = moment(new Date((`${d[1]}-${d[2]}-${d[3]} ${endHour}:${d[7]}:00`)));
    if (endOverMidnight) {
      this.endTime = this.endTime.add(1, "days");
    }
    this.duration = this.endTime.diff(this.startTime) / 60000;
  }

  command(): string {
    const startStr = this.getGopt3recTime();
    const channel = this.channelMapping[this.channel];
    const title = this.escapeBashSpecialChars(this.title);
    return `gopt3rec book -title="${title}" -tv=${channel} -start=${startStr} -min=${this.duration}`
  }

  private replaceMapping = {
    "!": "！",
    "<": "＜",
    ">": "＞",
    "\\?": "？",
    "\\(": "（",
    "\\)": "）",
    "#": "＃",
    "\\*": "＊",
    "\\$": "＄",
    "&": "＆",
    "\\^": "＾",
  }
  private escapeBashSpecialChars(src: string): string {
    let original = src;
    for (let key in this.replaceMapping) {
      const value = this.replaceMapping[key];
      const regexp = new RegExp(key, "g");
      original = original.replace(regexp, value);
    }
    return original;
  }

  private getGopt3recTime(): string {
    return this.startTime.format("MMDDHHmm");
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
    let dateLong: Element;
    const pt5p = doc.getElementsByClassName('pt5p');
    switch (pt5p.length) {
      case 4:
        dateLong = pt5p[1];
      case 3:
        dateLong = pt5p[0];
      case 6:
        dateLong = pt5p[0];
    }
    let date = dateLong.getElementsByTagName('em')[0].textContent;
    date = date.trim();

    const p = new Program(channel, title, date);
    copyToClipboard(p.command())
  }
}