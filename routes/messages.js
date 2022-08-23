"use strict";

const { UnauthorizedError } = require("../expressError");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  const user = res.locals.user.username;

  const message = await Message.get(req.params.id);

  if (message.from_user.username === user ||
    message.to_user.username === user) {
    return res.json({ message });
  }
  throw new UnauthorizedError("This message is not for your eyes!");
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const username = res.locals.user.username;
  const { to_username, body } = req.body;
  const message = await Message.create({ from_username: username, to_username, body });

  return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  const username = res.locals.user.username;
  const messageId = req.params.id;
  const messageToRead = await Message.get(messageId);
  if (messageToRead.to_user.username === username) {
    const message = await Message.markRead(messageId);
    return res.json({ message });
  }
  throw new UnauthorizedError("This message is not for your eyes!");

});


module.exports = router;