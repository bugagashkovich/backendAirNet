const sqlite3 = require("sqlite3").verbose();

const http = require("http");

const host = "localhost";
const port = 4000;

// Создаем базу данных или открываем существующую с проверкой наличия необходимых таблиц
const db = new sqlite3.Database("db", (error) => {
  error ? console.log(error) : null;
});

db.run("CREATE TABLE IF NOT EXISTS user (name TEXT)", (error) => {
  error ? console.log(error) : null;
});

db.run(
  "CREATE TABLE IF NOT EXISTS todo (name TEXT, description INTEGER, date INTEGER, state TEXT, owner INTEGER)",
  (error) => {
    error ? console.log(error) : null;
  }
);

const requestListener = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "DELETE, POST, GET, PUT, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  //   Обработчик URL
  //   Проверим наличие параметров, отделим их и приведем к объекту
  //   Отделяем URL от параметров
  let urlArray = req.url.split("?");
  let url = urlArray[0];
  let paramsString = null;
  let params = [];
  //   Проверяем наличие параметров и при их наличии превращаем в объект
  if (urlArray.length > 1) {
    paramsString = urlArray.slice(1)[0];
    params = paramsString.split("&");
    params = params.map((chunk) => {
      return chunk.split("=");
    });
    params = Object.fromEntries(params);
  } else {
    params = null;
  }
  switch (url) {
    // CRUD TODO
    case "/todo":
      if (params) {
        // Для одной задачи
        switch (req.method) {
          case "OPTIONS":
            console.log("1");
            res.writeHead(200);
            res.end(JSON.stringify("Продолжай"));
            break;
          case "GET":
            db.get(
              "SELECT rowid as id, name, description, date, state, owner FROM todo WHERE rowid=$id",
              { $id: params.id },
              (err, row) => {
                if (err) {
                  console.log(err);
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );

            break;
          case "POST":
            db.get(
              "INSERT INTO todo (name, description, date, state, owner) VALUES ($name, $description, $date, $state, $owner) RETURNING rowid as id, name, description, date, state, owner",
              {
                $name: params.name,
                $description: params.description,
                $date: params.date,
                $state: 0,
                $owner: params.owner,
              },
              (err, row) => {
                if (err) {
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );

            break;
          case "DELETE":
            db.get(
              "DELETE FROM todo WHERE rowid=$id RETURNING rowid as id, name, description, date, state, owner",
              {
                $id: params.id,
              },
              (err, row) => {
                if (err) {
                  res.writeHead(401);
                  console.log(JSON.stringify("Что-то пошло не так"));
                } else {
                  if (params) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );

            break;
          case "PUT":
            db.get(
              "UPDATE todo SET name=$name, description=$description, date=$date, owner=$owner RETURNING rowid as id, name, description, date, state, owner",
              {
                $name: params.name,
                $description: params.description,
                $date: params.date,
                $owner: params.owner,
              },
              (err, row) => {
                if (err) {
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );
            break;

          default:
            res.writeHead(400);
            res.end(JSON.stringify("Что-то пошло не так"));
            console.log(req);
            break;
        }
      } else {
        // Для получения задач всех пользователей (можно поменять на проекты)
        if (req.method == "GET") {
          db.all(
            "SELECT rowid AS id, name, description, date, state, owner FROM todo",
            (err, row) => {
              if (err) {
                res.writeHead(400);
                res.end(JSON.stringify(err));
              } else {
                res.writeHead(200);
                res.end(JSON.stringify(row));
              }
            }
          );
        } else {
          res.writeHead(400);
          res.end(JSON.stringify("Что-то пошло не так"));
        }
      }
      break;

    // Получить все задачи
    case "/todos":
      if (params) {
        // Для всех задач пользователя
        switch (req.method) {
          case "GET":
            db.all(
              "SELECT rowid as id, name, description, date, state, owner FROM todo WHERE owner=$id",
              { $id: params.id },
              (err, row) => {
                if (err) {
                  console.log(err);
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );
            break;

          default:
            res.writeHead(400);
            res.end(JSON.stringify("Что-то пошло не так"));
            console.log(req);
            break;
        }
      } else {
        // Для получения всех задач всех пользователей
        if (req.method == "GET") {
          db.all(
            "SELECT rowid AS id, name, description, date, state, owner FROM todo",
            (err, row) => {
              if (err) {
                res.writeHead(400);
                res.end(JSON.stringify(err));
              } else {
                res.writeHead(200);
                res.end(JSON.stringify(row));
              }
            }
          );
        } else {
          res.writeHead(400);
          res.end(JSON.stringify("Что-то пошло не так"));
        }
      }
      break;

    //   Пометить задачу как выполненную
    case "/do":
      if (params) {
        switch (req.method) {
          case "OPTIONS":
            res.writeHead(200);
            res.end(JSON.stringify("Продолжай"));
            break;
          case "PUT":
            db.get(
              "UPDATE todo SET state=$state WHERE rowid=$id RETURNING rowid as id, name, description, state, date, owner",
              { $id: params.id, $state: 1 },
              (err, row) => {
                if (err) {
                  res.writeHead(401);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );
            break;
          default:
            res.writeHead(501);
            res.end(JSON.stringify("Неверный метод"));
            break;
        }
      } else {
        res.writeHead(500);
        res.end(JSON.stringify("Запрос без параметров"));
      }
      break;

    //   Пометить задачу как невыполненную
    case "/undo":
      if (params) {
        switch (req.method) {
          case "OPTIONS":
            res.writeHead(200);
            res.end(JSON.stringify("Продолжай"));
            break;
          case "PUT":
            db.get(
              "UPDATE todo SET state=$state WHERE rowid=$id RETURNING rowid as id, name, description, state, date, owner",
              { $id: params.id, $state: 0 },
              (err, row) => {
                if (err) {
                  res.writeHead(401);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(
                      JSON.stringify("По Вашему запросу ничего не найдено")
                    );
                  }
                }
              }
            );
            break;
          default:
            res.writeHead(501);
            res.end(JSON.stringify("Неверный метод"));
            break;
        }
      } else {
        res.writeHead(500);
        res.end(JSON.stringify("Запрос без параметров"));
      }
      break;

    // CRUD USER
    case "/user":
      if (params) {
        // Для получения одного пользователя
        switch (req.method) {
          case "GET":
            db.get(
              "SELECT rowid as id, name FROM user WHERE rowid=$id",
              { $id: params.id },
              (err, row) => {
                err ? console.log(err) : null;
                if (row) {
                  res.writeHead(200);
                  res.end(JSON.stringify(row));
                } else {
                  res.writeHead(404);
                  res.end(
                    JSON.stringify("По Вашему запросу ничего не найдено")
                  );
                }
              }
            );

            break;
          case "POST":
            // Добавляем юзера и получаем его в виде ответа
            db.get(
              "INSERT INTO user (name) VALUES ($name) RETURNING rowid as id, name",
              { $name: params.name },
              (err, row) => {
                if (err) {
                  res.writeHead(401);
                  res.end(JSON.stringify(err));
                } else {
                  res.writeHead(200);
                  res.end(JSON.stringify(row));
                }
              }
            );
            break;
          case "DELETE":
            db.get(
              "DELETE FROM user WHERE rowid=$id RETURNING rowid as id, name",
              { $id: params.id },
              (err, row) => {
                if (err) {
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(JSON.stringify("Ничего не найдено"));
                  }
                }
              }
            );
            break;
          case "PUT":
            db.get(
              "UPDATE user SET name=$name WHERE rowid=$id RETURNING rowid as id, name",
              { $id: params.id, $name: params.name },
              (err, row) => {
                if (err) {
                  res.writeHead(400);
                  res.end(JSON.stringify(err));
                } else {
                  if (row) {
                    res.writeHead(200);
                    res.end(JSON.stringify(row));
                  } else {
                    res.writeHead(404);
                    res.end(JSON.stringify("Ничего не найдено"));
                  }
                }
              }
            );
            break;
          default:
            res.writeHead(400);
            res.end(JSON.stringify("Что-то пошло не так"));
            console.log(req);
            break;
        }
      } else {
        // Для получения всех пользователей
        if (req.method == "GET") {
          db.all("SELECT rowid AS id, name FROM user", (err, row) => {
            err ? console.log(err) : null;
            res.writeHead(200);
            res.end(JSON.stringify(JSON.stringify(row)));
          });
        } else {
          res.writeHead(400);
          res.end(JSON.stringify("Неверный метод"));
        }
      }
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "URL error" }));
  }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

process.on("exit", function () {
  console.log("Спиасибо за использование! Досвидания!");
  db.close();
});
