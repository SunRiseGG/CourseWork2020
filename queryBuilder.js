'use strict';

const { Pool } = require('pg');

const where = conditions => {
  let clause = '';
  const args = [];
  let i = 1;
  for (const key in conditions) {
    let value = conditions[key];
    let condition;
    if (typeof value === 'number') {
      condition = `${key} = $${i}`;
    } else if (typeof value === 'string') {
      if (value.startsWith('>=')) {
        condition = `${key} >= $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('<=')) {
        condition = `${key} <= $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('<>')) {
        condition = `${key} <> $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('>')) {
        condition = `${key} > $${i}`;
        value = value.substring(1);
      } else if (value.startsWith('<')) {
        condition = `${key} < $${i}`;
        value = value.substring(1);
      } else if (value.includes('*') || value.includes('?')) {
        value = value.replace(/\*/g, '%').replace(/\?/g, '_');
        condition = `${key} LIKE $${i}`;
      } else {
        condition = `${key} = $${i}`;
      }
    }
    i++;
    args.push(value);
    clause = clause ? `${clause} AND ${condition}` : condition;
  }
  return { clause, args };
};

const MODE_ROWS = 0;
const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class Cursor {
  constructor(database, table) {
    this.database = database;
    this.table = table;
    this.cols = null;
    this.rows = null;
    this.rowCount = 0;
    this.ready = false;
    this.mode = MODE_ROWS;
    this.whereClause = undefined;
    this.columns = ['*'];
    this.args = [];
    this.orderBy = undefined;
  }

  resolve(result) {
    const { rows, fields, rowCount } = result;
    this.rows = rows;
    this.cols = fields;
    this.rowCount = rowCount;
  }

  where(conditions) {
    const { clause, args } = where(conditions);
    this.whereClause = clause;
    this.args = args;
    return this;
  }

  fields(list) {
    this.columns = list;
    return this;
  }

  value() {
    this.mode = MODE_VALUE;
    return this;
  }

  row() {
    this.mode = MODE_ROW;
    return this;
  }

  col(name) {
    this.mode = MODE_COL;
    this.columnName = name;
    return this;
  }

  count() {
    this.mode = MODE_COUNT;
    return this;
  }

  order(name) {
    this.orderBy = name;
    return this;
  }

  insert(...values) {
    this.insertValues = values;
    return this;
  }

  then(callback) {
    // TODO: store callback to pool
    const { mode, table, columns, args } = this;
    const { insertValues, whereClause, orderBy, columnName } = this;
    const fields = columns.join(', ');

    if (insertValues) {
      const sql = `
        INSERT INTO ${table} (${fields})
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (${columns[0]})
        DO UPDATE SET ${columns[1]} = $2, ${columns[2]} = $3, ${columns[3]} = $4
      `;
      this.database.query(sql, insertValues, (err, res) => {
        if (callback) callback(err, res);
      });
    } else {
      let sql = `SELECT ${fields} FROM ${table}`;
      if (whereClause) sql += ` WHERE ${whereClause}`;
      if (orderBy) sql += ` ORDER BY ${orderBy}`;
      this.database.query(sql, args,  (err, res) => {
        this.resolve(res);
        const { rows, cols } = this;
        if (mode === MODE_VALUE) {
          const col = cols[0];
          const row = rows[0];
          callback(row[col.name]);
        } else if (mode === MODE_ROW) {
          callback(rows[0]);
        } else if (mode === MODE_COL) {
          const col = [];
          for (const row of rows) {
            col.push(row[columnName]);
          }
          callback(col);
        } else if (mode === MODE_COUNT) {
          callback(this.rowCount);
        } else {
          callback(rows);
        }
      });
    }
    return this;
  }
}

class Database {
  constructor(config, logger) {
    this.pool = new Pool(config);
    this.config = config;
    this.logger = logger;
  }

  query(sql, values, callback) {
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }
    this.pool.query(sql, values, (err, res) => {
      if (callback) callback(err, res);
    });
  }

  select(table) {
    return new Cursor(this, table);
  }

  close() {
    this.pool.end();
  }
}

module.exports = {
  open: (config, logger) => new Database(config, logger),
};
