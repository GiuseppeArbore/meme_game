import db from "./db.mjs";
import Didascalia from "./models/didascalie-model.mjs";

/**
 * This function maps the rows from the database to Didascalia objects.
 */
function mapRowsToDidascalie(rows){
    return rows.map(row => new Didascalia(row.id, row.text));
}

/**
 * This object contains the methods to interact with the didascalie table in the database.
**/
const DidascalieDao = {

    async get5DidascalieRandom(id_meme) {
        const query = `SELECT * 
                        FROM didascalie 
                        WHERE DIDASCALIE.id NOT IN (SELECT id_didascalia FROM didascalie_meme
                                                    WHERE id_meme = ?)
                        ORDER BY RANDOM() LIMIT 5`;
        return new Promise((resolve, reject) => {
            try {
                db.all(query, [id_meme], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRowsToDidascalie(rows));
                    }
                });
            } catch (err) { reject(err); 
            }
        });
    },
    async get2DidascalieCorretteRandom(id_meme) {
        const query = `SELECT * 
                        FROM didascalie 
                        WHERE DIDASCALIE.id IN (SELECT id_didascalia FROM didascalie_meme
                                                    WHERE id_meme = ?)
                        ORDER BY RANDOM() LIMIT 2`;
        return new Promise((resolve, reject) => {
            try {
                db.all(query, [id_meme], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRowsToDidascalie(rows));
                    }
                });
            } catch (err) { reject(err);
            }
        });
    },
    async get7DidascalieRandom(id_meme) {
        let did1 = await this.get5DidascalieRandom(id_meme);
        let did2 = await this.get2DidascalieCorretteRandom(id_meme);
        return did1.concat(did2).sort(() => Math.random() - 0.5);
    },
    
    async checkDidascalia(id_meme, id_didascalia) {
        const query = `SELECT * 
                        FROM didascalie_meme 
                        WHERE id_meme=? AND id_didascalia=?`;
        return new Promise((resolve, reject) => {
            db.all(query, [id_meme, id_didascalia], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (!rows){
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        }).catch(err => {
            console.error(err);
            throw err;
        });
    },

    async getAllDidascalieCorrette(id_meme) {
        const query = `SELECT * 
                        FROM didascalie 
                        WHERE DIDASCALIE.id IN (SELECT id_didascalia FROM didascalie_meme
                                                    WHERE id_meme = ?)
                        `;
        return new Promise((resolve, reject) => {
            db.all(query, [id_meme], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(mapRowsToDidascalie(rows));
                }
            });
        }).catch(err => {
            console.error(err);
            throw err;
        });
    }
    
};

export default DidascalieDao;