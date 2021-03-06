import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * SQLite client library for Node.js applications
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

function prepareParams(args, { offset = 0, excludeLastArg = false } = {}) {
  const hasOneParam = args.length === offset + 1 + (excludeLastArg ? 1 : 0);
  if (hasOneParam) {
    return args[offset];
  }
  return Array.prototype.slice.call(args, offset, args.length - (excludeLastArg ? 1 : 0));
}

function resolveTemplateStringObject(args, { offset = 0, excludeLastArg = false } = {}) {
  const hasOneParam = args.length === offset + 1 + (excludeLastArg ? 1 : 0);
  if (hasOneParam && typeof args[offset] === 'object') {
    return {
      sql: args[offset].sql,
      params: args[offset].values
    };
  }
  return {
    sql: args[offset],
    params: prepareParams(args, { offset: offset + 1, excludeLastArg })
  };
}

/**
 * SQLite client library for Node.js applications
 *
 * Copyright © 2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

class Statement {

  constructor(stmt, Promise) {
    this.stmt = stmt;
    this.Promise = Promise;
  }

  get sql() {
    return this.stmt.sql;
  }

  get lastID() {
    return this.stmt.lastID;
  }

  get changes() {
    return this.stmt.changes;
  }

  bind() {
    const params = prepareParams(arguments);
    return new this.Promise((resolve, reject) => {
      this.stmt.bind(params, err => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  reset() {
    return new this.Promise(resolve => {
      this.stmt.reset(() => {
        resolve(this);
      });
    });
  }

  finalize() {
    return new this.Promise((resolve, reject) => {
      this.stmt.finalize(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  run() {
    const params = prepareParams(arguments);
    return new this.Promise((resolve, reject) => {
      this.stmt.run(params, err => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get() {
    const params = prepareParams(arguments);
    return new this.Promise((resolve, reject) => {
      this.stmt.get(params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all() {
    const params = prepareParams(arguments);
    return new this.Promise((resolve, reject) => {
      this.stmt.all(params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  each() {
    const params = prepareParams(arguments, { excludeLastArg: true });
    const callback = arguments[arguments.length - 1];
    return new this.Promise((resolve, reject) => {
      this.stmt.each(params, callback, (err, rowsCount = 0) => {
        if (err) {
          reject(err);
        } else {
          resolve(rowsCount);
        }
      });
    });
  }

}

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

/**
 * SQLite client library for Node.js applications
 *
 * Copyright © 2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// eslint-disable-next-line no-unused-vars,import/no-unresolved,import/extensions
class Database {
  /**
   * Initializes a new instance of the database client.
   * @param {sqlite3.Database} driver An instance of SQLite3 driver library.
   * @param {{Promise: PromiseConstructor}} promiseLibrary ES6 Promise library to use.
     */
  constructor(driver, promiseLibrary) {
    this.driver = driver;
    this.Promise = promiseLibrary.Promise;
  }

  /**
   * Close the database.
   */
  close() {
    return new this.Promise((resolve, reject) => {
      this.driver.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Register listeners for Sqlite3 events
   *
   * @param {'trace'|'profile'|'error'|'open'|'close'} eventName
   * @param {() => void} listener trigger listener function
   */
  on(eventName, listener) {
    this.driver.on(eventName, listener);
  }

  run() {
    const { sql, params } = resolveTemplateStringObject(arguments);
    const Promise = this.Promise;
    return new Promise((resolve, reject) => {
      this.driver.run(sql, params, function runExecResult(err) {
        if (err) {
          reject(err);
        } else {
          // Per https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
          // when run() succeeds, the `this' object is a driver statement object. Wrap it as a
          // Statement.
          resolve(new Statement(this, Promise));
        }
      });
    });
  }

  get() {
    const { sql, params } = resolveTemplateStringObject(arguments);
    return new this.Promise((resolve, reject) => {
      this.driver.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all() {
    const { sql, params } = resolveTemplateStringObject(arguments);
    return new this.Promise((resolve, reject) => {
      this.driver.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Runs all the SQL queries in the supplied string. No result rows are retrieved.
   */
  exec(sql) {
    return new this.Promise((resolve, reject) => {
      this.driver.exec(sql, err => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  each() {
    const { sql, params } = resolveTemplateStringObject(arguments, { excludeLastArg: true });
    const callback = arguments[arguments.length - 1];
    return new this.Promise((resolve, reject) => {
      this.driver.each(sql, params, callback, (err, rowsCount = 0) => {
        if (err) {
          reject(err);
        } else {
          resolve(rowsCount);
        }
      });
    });
  }

  prepare() {
    const { sql, params } = resolveTemplateStringObject(arguments);
    return new this.Promise((resolve, reject) => {
      const stmt = this.driver.prepare(sql, params, err => {
        if (err) {
          reject(err);
        } else {
          resolve(new Statement(stmt, this.Promise));
        }
      });
    });
  }

  /**
   * Set a configuration option for the database.
   */
  configure(option, value) {
    this.driver.configure(option, value);
  }

  /**
   * Migrates database schema to the latest version
   */
  migrate({ force, table = 'migrations', migrationsPath = './migrations' } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      /* eslint-disable no-await-in-loop */
      const location = path.resolve(migrationsPath);

      // Get the list of migration files, for example:
      //   { id: 1, name: 'initial', filename: '001-initial.sql' }
      //   { id: 2, name: 'feature', fielname: '002-feature.sql' }
      const migrations = yield new _this.Promise(function (resolve, reject) {
        fs.readdir(location, function (err, files) {
          if (err) {
            reject(err);
          } else {
            resolve(files.map(function (x) {
              return x.match(/^(\d+).(.*?)\.sql$/);
            }).filter(function (x) {
              return x !== null;
            }).map(function (x) {
              return { id: Number(x[1]), name: x[2], filename: x[0] };
            }).sort(function (a, b) {
              return Math.sign(a.id - b.id);
            }));
          }
        });
      });

      if (!migrations.length) {
        throw new Error(`No migration files found in '${location}'.`);
      }

      // Get the list of migrations, for example:
      //   { id: 1, name: 'initial', filename: '001-initial.sql', up: ..., down: ... }
      //   { id: 2, name: 'feature', fielname: '002-feature.sql', up: ..., down: ... }
      yield Promise.all(migrations.map(function (migration) {
        return new _this.Promise(function (resolve, reject) {
          const filename = path.join(location, migration.filename);
          fs.readFile(filename, 'utf-8', function (err, data) {
            if (err) {
              reject(err);
            } else {
              const [up, down] = data.split(/^--\s+?down\b/mi);
              if (!down) {
                const message = `The ${migration.filename} file does not contain '-- Down' separator.`;
                reject(new Error(message));
              } else {
                /* eslint-disable no-param-reassign */
                migration.up = up.replace(/^-- .*?$/gm, '').trim(); // Remove comments
                migration.down = down.trim(); // and trim whitespaces
                /* eslint-enable no-param-reassign */
                resolve();
              }
            }
          });
        });
      }));

      // Create a database table for migrations meta data if it doesn't exist
      yield _this.run(`CREATE TABLE IF NOT EXISTS "${table}" (
  id   INTEGER PRIMARY KEY,
  name TEXT    NOT NULL,
  up   TEXT    NOT NULL,
  down TEXT    NOT NULL
)`);

      // Get the list of already applied migrations
      let dbMigrations = yield _this.all(`SELECT id, name, up, down FROM "${table}" ORDER BY id ASC`);

      // Undo migrations that exist only in the database but not in files,
      // also undo the last migration if the `force` option was set to `last`.
      const lastMigration = migrations[migrations.length - 1];
      for (const migration of dbMigrations.slice().sort(function (a, b) {
        return Math.sign(b.id - a.id);
      })) {
        if (!migrations.some(function (x) {
          return x.id === migration.id;
        }) || force === 'last' && migration.id === lastMigration.id) {
          yield _this.run('BEGIN');
          try {
            yield _this.exec(migration.down);
            yield _this.run(`DELETE FROM "${table}" WHERE id = ?`, migration.id);
            yield _this.run('COMMIT');
            dbMigrations = dbMigrations.filter(function (x) {
              return x.id !== migration.id;
            });
          } catch (err) {
            yield _this.run('ROLLBACK');
            throw err;
          }
        } else {
          break;
        }
      }

      // Apply pending migrations
      const lastMigrationId = dbMigrations.length ? dbMigrations[dbMigrations.length - 1].id : 0;
      for (const migration of migrations) {
        if (migration.id > lastMigrationId) {
          yield _this.run('BEGIN');
          try {
            yield _this.exec(migration.up);
            yield _this.run(`INSERT INTO "${table}" (id, name, up, down) VALUES (?, ?, ?, ?)`, migration.id, migration.name, migration.up, migration.down);
            yield _this.run('COMMIT');
          } catch (err) {
            yield _this.run('ROLLBACK');
            throw err;
          }
        }
      }

      /* eslint-enable no-await-in-loop */
      return _this;
    })();
  }
}

/**
 * SQLite client library for Node.js applications
 *
 * Copyright © 2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const promise = global.Promise;
const db = new Database(null, { Promise: promise });

/**
 * Opens SQLite database.
 *
 * @returns Promise<Database> A promise that resolves to an instance of SQLite database client.
 */
db.open = (filename, {
  mode = null,
  verbose = false,
  Promise = promise,
  cached = false } = {}) => {
  let driver;
  let DBDriver = sqlite3.Database;

  if (cached) {
    DBDriver = sqlite3.cached.Database;
  }

  if (verbose) {
    sqlite3.verbose();
  }

  return new Promise((resolve, reject) => {
    if (mode !== null) {
      driver = new DBDriver(filename, mode, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      driver = new DBDriver(filename, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  }).then(() => {
    db.driver = driver;
    db.Promise = Promise;
    return new Database(driver, { Promise });
  });
};

export default db;
//# sourceMappingURL=main.mjs.map
