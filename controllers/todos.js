const {
  BadRequestError,
  NotFoundError,
  ServerError,
  MethodError,
} = require("../errors/httpErrors");

async function todosController(params, method, db) {
  let answer = {
    data: null,
    code: 500,
  };
  if (params) {
    switch (method) {
      // Получить все задачи одного пользователя
      case "GET":
        let get_promise = new Promise((resolve, reject) => {
          db.all(
            "SELECT rowid as id, name, description, date, state, owner FROM todo WHERE owner=$id",
            { $id: params.id },
            (err, row) => {
              if (err) {
                reject(new ServerError("DB error"));
              }
              if (!row) {
                reject(new NotFoundError("404"));
              }

              answer.code = 200;
              answer.data = row;

              resolve(answer);
            }
          );
        });
        return get_promise;

      default:
        throw new MethodError("Method Error");
    }
  } else {
    switch (method) {
      case "GET":
        let get_all_promise = new Promise((resolve, reject) => {
          db.all(
            "SELECT rowid AS id, name, description, date, state, owner FROM todo",
            (err, row) => {
              if (err) {
                reject(new ServerError("DB error"));
              }
              if (!row) {
                reject(new NotFoundError("404"));
              }

              answer.code = 200;
              answer.data = row;

              resolve(answer);
            }
          );
        });
        return get_all_promise;

      default:
        throw new MethodError("Method Error");
    }
  }
}

module.exports = { todosController };
