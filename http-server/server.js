/*
    http 기본 형태
*/
// http 서버 모듈
const http = require("http");
const hostname = "127.0.0.1";
const port = 9999; // 사용하려고 하는 포트 정보

// url parse 를 사용
const url = require("url");
const qs = require("querystring"); // querystring 모듈 사용

// 상대경로 사용에 필요한 path 모듈
const path = require("path");
// 파일 read 모듈
const fs = require("fs");
const htmlTemplate = require("./tebplate/html-template");
// 스크립트 보안을 위한 태그 라이브러리
//const sanitizeHtml = require("sanitize-html");

// http 모듈을 통한 서버 생성
const server = http.createServer((request, response) => {
    // url 도듈 , url 뒤에 있는 디렉토리/ 파일이름 파싱
    const urlObj = url.parse(request.url, true);
    //console.log(urlObj);
    const pathname = urlObj.pathname;
    const queryData = urlObj.query;
    const method = request.method;

    let responseFileName = "../index.html";
    let baseDataPath = "../data";

    if (pathname === "/index") {
        responseFileName = "./html/index.html";
        responseFileName = path.join(__dirname, responseFileName);
    }

    console.log(`<<<<<<<   ${pathname}`);

    // 도메인/data 일 경우 에만 타도록
    if (pathname.indexOf("/data") === 0) {
        responseFileName = "./html/data.html";
        responseFileName = path.join(__dirname, responseFileName);

        if (pathname === "/data/create") {
            fs.readdir(baseDataPath, (err, fileList) => {
                if (err) {
                    console.log(err);
                    response.writeHead(404, { "Content-Type": "text/html" });
                }
                const list = htmlTemplate.list(fileList);
                let body = `<form action="/data/create_process" method="post">
                            <p><input type="text" name="title" placeholder="title"></p>
                            <p>
                            <textarea name="description" placeholder="description"></textarea>
                            </p>
                            <p>
                            <input type="submit">
                            </p>
                            </form>`;
                let control = ``;
                let html = htmlTemplate.HTML(list, body, control);
                response.writeHead(200);
                response.end(html);
            });
        } else if (pathname === "/data/create_process") {
            let body = "";
            request.on("data", function (data) {
                body = body + data;
            });
            request.on("end", function () {
                const post = qs.parse(body);
                const title = post.title;
                const description = post.description;
                fs.writeFile(
                    `${baseDataPath}/${title}`,
                    description,
                    "utf8",
                    function (err) {
                        response.writeHead(302, {
                            Location: `/data/?id=${title}`,
                        });
                        response.end();
                    }
                );
            });
        } else if (pathname === "/data/update") {
            fs.readdir(baseDataPath, function (err, fileList) {
                if (err) {
                    console.log(err);
                    response.writeHead(404, { "Content-Type": "text/html" });
                }
                const list = htmlTemplate.list(fileList);
                const filteredId = path.parse(queryData.id).base;

                let control = `<a href="/create">create</a> <a href="/update?id=${filteredId}">update</a>`;
                fs.readFile(`${baseDataPath}/${filteredId}`, "utf8", function (
                    err,
                    description
                ) {
                    let body = `<form action="/data/update_process" method="post">
                            <input type="hidden" name="id" value="${filteredId}">
                            <p><input type="text" name="title" placeholder="title" value="${filteredId}"></p>
                            <p><textarea name="description" placeholder="description">${description}</textarea>
                            </p><p><input type="submit"></p></form>
                `;
                    let html = htmlTemplate.HTML(list, body, control);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        } else if (pathname === "/data/update_process") {
            let body = "";
            request.on("data", function (data) {
                body = body + data;
            });
            request.on("end", function () {
                const post = qs.parse(body);
                const id = post.id;
                const title = post.title;
                const description = post.description;
                fs.rename(
                    `${baseDataPath}/${id}`,
                    `${baseDataPath}/${title}`,
                    function (error) {
                        fs.writeFile(
                            `${baseDataPath}/${title}`,
                            description,
                            "utf8",
                            function (err) {
                                response.writeHead(302, {
                                    Location: `${baseDataPath}/?id=${title}`,
                                });
                                response.end();
                            }
                        );
                    }
                );
            });
        } else if (pathname === "/data/delete_process") {
            let body = "";
            request.on("data", function (data) {
                body = body + data;
            });
            request.on("end", function () {
                const post = qs.parse(body);
                const id = post.id;
                const filteredId = path.parse(id).base;
                fs.unlink(`${baseDataPath}/${filteredId}`, function (error) {
                    response.writeHead(302, { Location: `/data` });
                    response.end();
                });
            });
        } else {
            fs.readdir(baseDataPath, (err, fileList) => {
                if (err) {
                    console.log(err);
                    response.writeHead(404, { "Content-Type": "text/html" });
                }
                const list = htmlTemplate.list(fileList);
                let body = "";
                let control = `<a href="/data/create">create</a>`;
                let html = htmlTemplate.HTML(list, body, control);

                if (queryData !== undefined && queryData.id !== undefined) {
                    const filteredId = path.parse(queryData.id).base;

                    fs.readFile(
                        baseDataPath + `/${filteredId}`,
                        "utf8",
                        function (err, description) {
                            body = `<h2>${filteredId}</h2>${description}`;
                            control = `<a href="/data/create">create</a>
                                <a href="/data/update?id=${filteredId}">update</a>
                                <form action="/data/delete_process" method="post">
                                    <input type="hidden" name="id" value="${filteredId}">
                                    <input type="submit" value="delete">
                                </form>`;

                            /*
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags: ["h1"],
                    });
                    */
                            html = htmlTemplate.HTML(list, body, control);
                            response.writeHead(200, {
                                "Content-Type": "text/html",
                            });
                            response.end(html);
                        }
                    );
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.end(html);
                }
            });
        }
    } else {
        console.log(
            `url : ${pathname}, 호출매소드 : ${method},  경로 : ${responseFileName}`
        );

        // 파일을 읽기
        fs.readFile(responseFileName, (err, data) => {
            if (err) {
                console.log(err);
                // 페이지를 찾을 수 없음
                // HTTP Status: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, { "Content-Type": "text/html" });
            } else {
                // 페이지를 찾음
                // HTTP Status: 200 : OK
                // Content Type: text/plain
                response.writeHead(200, { "Content-Type": "text/html" });

                // 파일을 읽어와서 responseBody 에 작성
                response.write(data.toString());
            }
            // responseBody 전송
            response.end();
        });
    }
});

// 서버 리스너 실행
server.listen(port, hostname, () => {
    console.log(`listen port = ${port} connect success hostname = ${hostname}`);
    console.log(`Server running at http://${hostname}:${port}/`);
});
