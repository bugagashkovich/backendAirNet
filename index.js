const sqlite3 = require("sqlite3").verbose();
const http = require("http");

const { doController } = require("./controllers/do");
const { undoController } = require("./controllers/undo");
const { todoController } = require("./controllers/todo");
const { todosController } = require("./controllers/todos");
const { userController } = require("./controllers/user");

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
      todoController(params, req.method, db)
        .then((answer) => {
          res.writeHead(answer.code);
          res.end(JSON.stringify(answer.data));
        })
        .catch((err) => {
          res.writeHead(err.code);
          res.end(JSON.stringify(err.message));
        });
      break;

    // Получить все задачи
    case "/todos":
      todosController(params, req.method, db)
        .then((answer) => {
          res.writeHead(answer.code);
          res.end(JSON.stringify(answer.data));
        })
        .catch((err) => {
          res.writeHead(err.code);
          res.end(JSON.stringify(err.message));
        });
      break;

    //   Пометить задачу как выполненную
    case "/do":
      doController(params, req.method, db)
        .then((answer) => {
          res.writeHead(answer.code);
          res.end(JSON.stringify(answer.data));
        })
        .catch((err) => {
          res.writeHead(err.code);
          res.end(JSON.stringify(err.message));
        });

      break;

    //   Пометить задачу как невыполненную
    case "/undo":
      undoController(params, req.method, db)
        .then((answer) => {
          res.writeHead(answer.code);
          res.end(JSON.stringify(answer.data));
        })
        .catch((err) => {
          res.writeHead(err.code);
          res.end(JSON.stringify(err.message));
        });
      break;

    // CRUD USER
    case "/user":
      userController(params, req.method, db)
        .then((answer) => {
          res.writeHead(answer.code);
          res.end(JSON.stringify(answer.data));
        })
        .catch((err) => {
          res.writeHead(err.code);
          res.end(JSON.stringify(err.message));
        });
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
  console.log("Спасибо за использование! Досвидания!");
  db.close();
});
