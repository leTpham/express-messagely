"use strict";

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

//FIXME:this route needs to hash before calling the register method on the user class

module.exports = router;