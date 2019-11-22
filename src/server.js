require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const databaseConfig = require("./config/database");

class App {
  constructor() {
    this.express = express();
    this.express.use(cors());

    this.isDev = process.env.NODE_ENV != "development";

    this.database();
    this.middlewares();
    this.routes();
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true
    });
  }

  middlewares() {
    this.express.use(express.json());
  }

  routes() {
    this.express.use(require("./routes"));
  }
}

module.exports = new App().express;
