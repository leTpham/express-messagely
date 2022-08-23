"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");


const app = require("../app");
const db = require("../db");
const User = require("../models/user");

let u1Token;

describe("Auth Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    u1Token = jwt.sign(u1, SECRET_KEY);


  });

  /** POST /auth/register => token  */

  describe("GET /users/", function () {
    test("can get list of users", async function () {
      let response = await request(app)
        .get("/users/")
        .query({ _token: u1Token });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
          users: [{ username: "test1", first_name: "Test1", last_name: "Testy1" }]
    });
      });
  });
});


afterAll(async function () {
  await db.end();
});

