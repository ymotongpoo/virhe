chrome.contextMenus.create({
    "title": "virhe",
    "type": "normal",
    "contexts": ["link"],
    "onclick": function (info, tab) {
        var url = info.linkUrl;
        var command = callXHR(url, createCommand);
        console.log(command);
    }
});

var callXHR = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function (ev) {
        if (ev !== null) {
            var title = ev.target.responseXML.getElementsByClassName('yjM')[0].innerText;
            title = title.trim();
            var ch = ev.target.responseXML.getElementsByClassName('yjS')[0].innerText;
            ch = ch.trim();
            var dt = ev.target.responseXML.getElementsByClassName('pt5p')[0].innerText;
            dt = dt.trim();

            // copy text to clipboard
            var textArea = document.createElement('textarea');
            document.body.appendChild(textArea);
            textArea.value = callback({
                ch: ch,
                title: title,
                date: dt
            });
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    xhr.open('GET', url);
    xhr.send();
    xhr.responseType = "document";
};

var createCommand = function (program) {
    return program.ch + ' : ' + program.title + ' : ' + program.date;
};