const {
  BadRequestError,
  NotFoundError,
  ServerError,
  MethodError,
} = require("../errors/httpErrors");

async function undoController(params, method, db) {
  let answer = {
    data: null,
    code: 500,
  };
  if (params) {
    switch (method) {
      case "OPTIONS":
        answer.code = 200;
        return answer;

      case "PUT":
        let promise = new Promise((resolve, reject) => {
          db.get(
            "UPDATE todo SET state=$state WHERE rowid=$id RETURNING rowid as id, name, description, state, date, owner",
            { $id: params.id, $state: 0 },
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

        return promise;
      default:
        throw new MethodError("Method Error");
    }
  } else {
    throw new BadRequestError("Bad Request");
  }
}

module.exports = { undoController };
