"use strict";

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

const bcrypt = require("bcrypt");

/** User of the site. */

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `INSERT INTO users (
        username, 
        password, 
        first_name, 
        last_name, 
        phone, 
        join_at, 
        last_login_at
      )
         VALUES
           ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return results.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT password
          FROM users
          WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];

    return user && ((await bcrypt.compare(password, user.password)) === true)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE username=$1`,
        [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
          FROM users
          ORDER BY username`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
          FROM users
          WHERE username = $1`,
      [username]
    );
    return results.rows[0];

    //TODO: THROW ERROR???
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const mResults = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at,
        u.username, u.first_name, u.last_name, u.phone
          FROM messages AS m
            JOIN users AS u
              ON m.to_username = u.username
          WHERE m.from_username = $1`,
      [username]
    );

    const messages = mResults.rows.map((m) => ({
      id: m.id,
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
      to_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
    }));
    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const mResults = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at,
        u.username, u.first_name, u.last_name, u.phone
          FROM messages AS m
            JOIN users AS u
              ON m.from_username = u.username
          WHERE m.to_username = $1`,
      [username]
    );

    const messages = mResults.rows.map((m) => ({
      id: m.id,
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
      from_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
    }));
    return messages;
  }
}

module.exports = User;
