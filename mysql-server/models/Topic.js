const DataSource = require("../config/DataSource");
const template = require("../template/Template");
const url = require("url");
const qs = require("querystring");

exports.home = function (request, response) {
    DataSource.query(`SELECT * FROM topic`, function (error, topics) {
        const title = "Welcome";
        const description = "Hello, Node.js";
        const list = template.list(topics);
        const control = `<a href="/topic/create">create</a>`;
        const html = template.HTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            control
        );
        response.writeHead(200);
        response.end(html);
    });
};

exports.page = (request, response) => {
    const urlObj = url.parse(request.url, true);
    const queryData = urlObj.query;

    DataSource.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) {
            throw error;
        }
        DataSource.query(
            `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
            [queryData.id],
            (error2, topic) => {
                if (error2) {
                    throw error2;
                }
                const title = topic[0].title;
                const description = topic[0].description;
                const list = template.list(topics);
                const body = `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`;
                const control = ` <a href="/topic/create">create</a><a href="/topic/update?id=${queryData.id}">update</a>
                                  <form action="/topic/delete_process" method="post">
                                    <input type="hidden" name="id" value="${queryData.id}">
                                    <input type="submit" value="delete">
                                  </form>`;
                const html = template.HTML(title, list, body, control);
                response.writeHead(200);
                response.end(html);
            }
        );
    });
};

exports.create = (request, response) => {
    DataSource.query(`SELECT * FROM topic`, (error, topics) => {
        DataSource.query("SELECT * FROM author", (error2, authors) => {
            const title = "Create";
            const list = template.list(topics);
            const body = `<form action="/topic/create_process" method="post">
                              <p><input type="text" name="title" placeholder="title"></p>
                              <p><textarea name="description" placeholder="description"></textarea></p>
                              <p>${template.authorSelect(authors)}</p>
                              <p><input type="submit"></p>
                          </form>`;
            const control = `<a href="/topic/create">create</a>`;
            const html = template.HTML(title, list, body, control);
            response.writeHead(200);
            response.end(html);
        });
    });
};

exports.create_process = (request, response) => {
    let body = "";
    request.on("data", (data) => {
        body = body + data;
    });
    request.on("end", () => {
        const post = qs.parse(body);
        DataSource.query(
            `INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {
                    Location: `/?id=${result.insertId}`,
                });
                response.end();
            }
        );
    });
};

exports.update = (request, response) => {
    const urlObj = url.parse(request.url, true);
    const queryData = urlObj.query;

    DataSource.query("SELECT * FROM topic", (error, topics) => {
        if (error) {
            throw error;
        }
        DataSource.query(
            `SELECT * FROM topic WHERE id=?`,
            [queryData.id],
            (error2, topic) => {
                if (error2) {
                    throw error2;
                }
                DataSource.query("SELECT * FROM author", (error2, authors) => {
                    const list = template.list(topics);
                    const body = `<form action="/topic/update_process" method="post">
                                      <input type="hidden" name="id" value="${
                                          topic[0].id
                                      }"><p>
                                      <input type="text" name="title" placeholder="title" value="${
                                          topic[0].title
                                      }"></p><p>
                                      <textarea name="description" placeholder="description">${
                                          topic[0].description
                                      }</textarea></p>
                                      <p>${template.authorSelect(
                                          authors,
                                          topic[0].author_id
                                      )}</p><p>
                                      <input type="submit"></p>
                                  </form>`;
                    const control = `<a href="/topic/create">create</a> <a href="/topic/update?id=${topic[0].id}">update</a>`;
                    const html = template.HTML(
                        topic[0].title,
                        list,
                        body,
                        control
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            }
        );
    });
};

exports.update_process = (request, response) => {
    let body = "";
    request.on("data", (data) => {
        body = body + data;
    });
    request.on("end", () => {
        const post = qs.parse(body);
        DataSource.query(
            "UPDATE topic SET title=?, description=?, author_id=? WHERE id=?",
            [post.title, post.description, post.author, post.id],
            (error, result) => {
                response.writeHead(302, { Location: `/?id=${post.id}` });
                response.end();
            }
        );
    });
};

exports.delete_process = (request, response) => {
    let body = "";
    request.on("data", (data) => {
        body = body + data;
    });
    request.on("end", () => {
        const post = qs.parse(body);
        DataSource.query(
            "DELETE FROM topic WHERE id = ?",
            [post.id],
            (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/` });
                response.end();
            }
        );
    });
};
