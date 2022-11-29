const {
  BadRequestError,
  NotFoundError,
  ServerError,
  MethodError,
} = require("../errors/httpErrors");

async function userController(params, method, db) {
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
            "SELECT rowid as id, name FROM user WHERE rowid=$id",
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
            "INSERT INTO user (name) VALUES ($name) RETURNING rowid as id, name",
            { $name: params.name },
            (err, row) => {
              if (err) {
                reject(new ServerError("DB error"));
              }
              if (!row) {
                reject(new ServerError("DB erro"));
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
            "UPDATE user SET name=$name WHERE rowid=$id RETURNING rowid as id, name",
            { $id: params.id, $name: params.name },
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
            "DELETE FROM user WHERE rowid=$id RETURNING rowid as id, name",
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
        return del_promise;

      default:
        throw new MethodError("Method Error");
    }
  } else {
    switch (method) {
      case "GET":
        let all_get_promise = new Promise((resolve, reject) => {
          db.all("SELECT rowid AS id, name FROM user", (err, row) => {
            if (err) {
              reject(new ServerError("DB error"));
            }
            if (!row) {
              reject(new NotFoundError("404"));
            }

            answer.code = 200;
            answer.data = row;

            resolve(answer);
          });
        });

        return all_get_promise;

      default:
        throw new MethodError("Method Error");
        break;
    }
  }
}

module.exports = { userController };
