"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");


const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

let u1Token;
let u2Token;

describe("User Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });
    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2",
    });
    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1",
    });

    u1Token = jwt.sign({ username: u1.username }, SECRET_KEY);
    u2Token = jwt.sign({ username: u2.username }, SECRET_KEY);

  });

  /** GET /users get list of users
   *  => {users: [{username, first_name, last_name}, ...]} */

  describe("GET /users/", function () {
    test("can get list of users", async function () {
      let response = await request(app)
        .get("/users/")
        .query({ _token: u1Token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        users: [
          { username: "test1", first_name: "Test1", last_name: "Testy1" },
          { username: "test2", first_name: "Test2", last_name: "Testy2" }
        ]
      });
    });

    test("returns 401 when logged out", async function () {
      const response = await request(app)
        .get(`/users`); // no token being sent!
      expect(response.statusCode).toEqual(401);
    });

    test("returns 401 with invalid token", async function () {
      const response = await request(app)
        .get(`/users`)
        .query({ _token: "garbage" }); // invalid token!
      expect(response.statusCode).toEqual(401);
    });
  });


  /** GET /users/:username - get detail of users.
   *
   * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
   *
   **/

  describe("GET /users/:username", function () {
    test("can get detail of user", async function () {
      let response = await request(app)
        .get("/users/test1")
        .query({ _token: u1Token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        user: {
          username: "test1",
          first_name: "Test1",
          last_name: "Testy1",
          phone: "+14155550000",
          last_login_at: expect.any(String),
          join_at: expect.any(String),
        }
      });
    });

    test("returns 401 when logged out", async function () {
      const response = await request(app)
        .get(`/users/junk`); // no token being sent!
      expect(response.statusCode).toEqual(401);
    });

    test("returns 401 with invalid token", async function () {
      const response = await request(app)
        .get(`/users/test1`)
        .query({ _token: "garbage" }); // invalid token!
      expect(response.statusCode).toEqual(401);
    });


  });

  /** GET /:username/to - get messages to user
   *
   * => {messages: [{id,
   *                 body,
   *                 sent_at,
   *                 read_at,
   *                 from_user: {username, first_name, last_name, phone}}, ...]}
   *
   **/
  describe("GET /users/:username/to", function () {
    test("can get messages to user", async function () {
      let response = await request(app)
        .get("/users/test1/to")
        .query({ _token: u1Token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        messages: [{
          id: 2,
          body: "u2-to-u1",
          sent_at: expect.any(String),
          read_at: null,
          from_user: {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155552222"
          }
        }]
      });
    });


    test("returns 401 when logged out", async function () {
      const response = await request(app)
        .get(`/users/junk`); // no token being sent!
      expect(response.statusCode).toEqual(401);
    });

    test("returns 401 with invalid token", async function () {
      const response = await request(app)
        .get(`/users/test1`)
        .query({ _token: "garbage" }); // invalid token!
      expect(response.statusCode).toEqual(401);
    });













  });



});







afterAll(async function () {
  await db.end();
});

