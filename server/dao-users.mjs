/* Data Access Object (DAO) module for accessing users data */

import db from "./db.mjs";
import crypto from "crypto";


/***
 *  DAO for the users
 */
export default function UserDao() {

    this.getUserById = (id) => {
        return new Promise((resolve, reject) => {
            try {
                const query = 'SELECT * FROM users WHERE id=?';
                db.get(query, [id], (err, row) => {
                    if (err) {
                        reject({ error: err.message });
                        return;
                    }
                    if (row === undefined) {
                        resolve({ error: 'User not found' });
                    } else {
                        resolve(row);
                    }
                });
            } catch (err) { reject({ error: err.message }); }
        });
    };

    this.getUser = (email, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email=?';
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                }
                else {
                    const user = { id: row.id, username: row.email, name: row.name };

                    crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { 
                        if (err) reject(err);
                        if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) 
                            resolve(false);
                        else
                            resolve(user);
                    });
                }
            });
        });
    }

}