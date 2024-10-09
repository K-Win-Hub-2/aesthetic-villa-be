const express = require("express"),
  router = express.Router(),
  glob = require("glob"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  compress = require("compression"),
  methodOverride = require("method-override"),
  cors = require("cors"),
  rootDir = `${__dirname}/../`;

const path = require("path"),
  rootPath = path.normalize(__dirname + "/..");

module.exports = function (app, config) {
  app.disable("x-powered-by");
  app.use(logger("dev"));
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());
  app.use(
    cors({
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "x-access-token",
      ],
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      preflightContinue: false,
    })
  );
  const routes = glob.sync(config.root + '/app/routes/*.js');
  routes.forEach(function(route) {
    require(route)(app);
  });
};
