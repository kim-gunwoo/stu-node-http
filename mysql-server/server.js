const http = require("http");
const hostname = "127.0.0.1";
const port = 9999;

const url = require("url");
const topic = require("./models/Topic");
const author = require("./models/Author");

const server = http.createServer(function (request, response) {
    const urlObj = url.parse(request.url, true);
    const queryData = urlObj.query;
    const pathname = urlObj.pathname;

    if (pathname === "/") {
        if (queryData.id === undefined) {
            topic.home(request, response);
        } else {
            topic.page(request, response);
        }
    } else if (pathname === "/topic/create") {
        topic.create(request, response);
    } else if (pathname === "/topic/create_process") {
        topic.create_process(request, response);
    } else if (pathname === "/topic/update") {
        topic.update(request, response);
    } else if (pathname === "/topic/update_process") {
        topic.update_process(request, response);
    } else if (pathname === "/topic/delete_process") {
        topic.delete_process(request, response);
    } else if (pathname === "/author") {
        author.home(request, response);
    } else if (pathname === "/author/create_process") {
        author.create_process(request, response);
    } else if (pathname === "/author/update") {
        author.update(request, response);
    } else if (pathname === "/author/update_process") {
        author.update_process(request, response);
    } else if (pathname === "/author/delete_process") {
        author.delete_process(request, response);
    } else {
        response.writeHead(404);
        response.end("Not found");
    }
});

server.listen(port, hostname, () => {
    console.log(`listen port = ${port} connect success hostname = ${hostname}`);
    console.log(`Server running at http://${hostname}:${port}/`);
});
