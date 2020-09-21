const DataSource = require("../config/DataSource");
const template = require("../template/Template");
const url = require("url");
const qs = require("querystring");

exports.home = (request, response) => {
    DataSource.query(`SELECT * FROM topic`, (error, topics) => {
        DataSource.query(`SELECT * FROM author`, (error2, authors) => {
            const title = "author";
            const list = template.list(topics);
            const body = `${template.authorTable(authors)}
                            <style>
                                table{
                                    border-collapse: collapse;
                                }
                                td{
                                    border:1px solid black;
                                }
                            </style>
                            <form action="/author/create_process" method="post">
                                <p>
                                    <input type="text" name="name" placeholder="name">
                                </p>
                                <p>
                                    <textarea name="profile" placeholder="description"></textarea>
                                </p>
                                <p>
                                    <input type="submit"  value="create">
                                </p>
                            </form>`;
            const control = ``;
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
            `
            INSERT INTO author (name, profile) 
              VALUES(?, ?)`,
            [post.name, post.profile],
            (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            }
        );
    });
};

exports.update = (request, response) => {
    DataSource.query(`SELECT * FROM topic`, (error, topics) => {
        DataSource.query(`SELECT * FROM author`, (error2, authors) => {
            const urlObj = url.parse(request.url, true);
            const queryData = urlObj.query;
            DataSource.query(
                `SELECT * FROM author WHERE id=?`,
                [queryData.id],
                (error3, author) => {
                    const title = "author";
                    const list = template.list(topics);
                    const body = `${template.authorTable(authors)}
                                    <style>
                                        table{
                                            border-collapse: collapse;
                                        }
                                        td{
                                            border:1px solid black;
                                        }
                                    </style>
                                    <form action="/author/update_process" method="post">
                                        <p>
                                            <input type="hidden" name="id" value="${
                                                queryData.id
                                            }">
                                        </p>
                                        <p>
                                            <input type="text" name="name" value="${
                                                author[0].name
                                            }" placeholder="name">
                                        </p>
                                        <p>
                                            <textarea name="profile" placeholder="description">${
                                                author[0].profile
                                            }</textarea>
                                        </p>
                                        <p>
                                            <input type="submit" value="update">
                                        </p>
                                    </form>`;
                    const control = ``;
                    const html = template.HTML(title, list, body, control);
                    response.writeHead(200);
                    response.end(html);
                }
            );
        });
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
            `
            UPDATE author SET name=?, profile=? WHERE id=?`,
            [post.name, post.profile, post.id],
            (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/author` });
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
            `DELETE FROM topic WHERE author_id=?`,
            [post.id],
            (error1, result1) => {
                if (error1) {
                    throw error1;
                }
                DataSource.query(
                    `
                    DELETE FROM author WHERE id=?`,
                    [post.id],
                    (error2, result2) => {
                        if (error2) {
                            throw error2;
                        }
                        response.writeHead(302, { Location: `/author` });
                        response.end();
                    }
                );
            }
        );
    });
};
