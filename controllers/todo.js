const {
  BadRequestError,
  NotFoundError,
  ServerError,
  MethodError,
} = require("../errors/httpErrors");

async function todoController(params, method, db) {
  let answer = {
    data: null,
    code: 500,
  };
  if (params) {
    switch (method) {
      case "OPTIONS":
        answer.code = 200;
        return answer;

      case "GET":
        let get_promise = new Promise((resolve, reject) => {
          db.get(
            "SELECT rowid as id, name, description, date, state, owner FROM todo WHERE rowid=$id",
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

      case "POST":
        let post_promise = new Promise((resolve, reject) => {
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
                reject(new ServerError("DB error"));
              }
              if (!row) {
                reject(new ServerError("DB error"));
              }

              answer.code = 200;
              answer.data = row;

              resolve(answer);
            }
          );
        });
        return post_promise;

      case "PUT":
        let put_promise = new Promise((resolve, reject) => {
          db.get(
            "UPDATE todo SET name=$name, description=$description, date=$date, owner=$owner WHERE rowid=$id RETURNING rowid as id, name, description, date, state, owner",
            {
              $id: params.id,
              $name: params.name,
              $description: params.description,
              $date: params.date,
              $owner: params.owner,
            },
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
        return put_promise;

      case "DELETE":
        let del_promise = new Promise((resolve, reject) => {
          db.get(
            "DELETE FROM todo WHERE rowid=$id RETURNING rowid as id, name, description, date, state, owner",
            {
              $id: params.id,
            },
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
        return del_promise;

      default:
        throw new MethodError("Method Error");
        break;
    }
  } else {
    throw new BadRequestError("Bad Request");
  }
}

module.exports = { todoController };
