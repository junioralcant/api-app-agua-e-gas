const express = require("express");

const routes = express.Router();

const controllers = require("./app/controllers/");

/**
 * Categoria
 */
routes.get("/categorias", controllers.CategoriaController.index);
routes.post("/categorias", controllers.CategoriaController.store);
routes.get("/categorias/:id", controllers.CategoriaController.show);
routes.put("/categorias/:id", controllers.CategoriaController.update);
routes.delete("/categorias/:id", controllers.CategoriaController.destroy);

module.exports = routes;
