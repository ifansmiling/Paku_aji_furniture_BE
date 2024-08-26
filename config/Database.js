const Sequelize = require("sequelize");

const db = new Sequelize("pakuaji", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const database = db;

module.exports = database;
