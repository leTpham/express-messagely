"use strict";

const { BCRYPT_WORK_FACTOR } = require('../config');

const bcrypt = require("bcrypt");
/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
         VALUES
           ($1, $2, $3, $4, $5)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

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
    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users
        SET last_login_at=${CURRENT_TIMESTAMP}
        WHERE username=${username}`
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
    const results = db.query(
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
    const mResults = db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at,
        u.username, u.first_name, u.last_name, u.phone
          FROM messages AS m
            JOIN users AS u
              ON m.to_username = u.username
          WHERE m.from_username = $1`,
      [username]
    );

    const messages = mResults.map(
      m => {{
        id: m.id, body: m.body,


      }}
    );


  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;


//HERE:
// INSERT INTO users (username, password, first_name, last_name, phone, join_at)  VALUES ('test_user', 'password', 'test', 'user', '1234567890', CURRENT_TIMESTAMP);

// INSERT INTO users (username, password, first_name, last_name, phone, join_at)  VALUES ('test_user2', 'password', 'test2', 'user2', '0234567890', CURRENT_TIMESTAMP);

// INSERT INTO messages (from_username, to_username, body, sent_at) VALUES('test_user', 'test_user2', 'heeeyyy', CURRENT_TIMESTAMP); 