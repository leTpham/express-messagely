"use strict";

const Router = require("express").Router;
const jwt = require("jsonwebtoken");

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");


const router = new Router();

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  const user = await User.authenticate(username, password);

  if (user) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }

  throw new UnauthorizedError("Invalid username/password.");

});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  const user = await User.register({
    username, password, first_name, last_name, phone});

  if (user) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError("Make sure all fields are filled.");

});

module.exports = router;
