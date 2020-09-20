module.exports = {
    HTML: function (list, body, control) {
        return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/index">/http/index.html 로 이동</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
    },
    list: function (filelist) {
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
            list =
                list +
                `<li><a href="/data?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + "</ul>";
        return list;
    },
};
