const Sequelize = require("sequelize");

const db = new Sequelize("db_pakuaji", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const database = db;

module.exports = database;
