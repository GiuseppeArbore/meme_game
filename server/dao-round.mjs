import db from "./db.mjs";  
import Round from "./models/round-model.mjs";

/***
 * This function maps the rows from the database to Round objects.
 */
function mapRowsToRound(rows){
    return rows.map(row => new Round(row.id_round, row.id_meme, row.punteggio));
}

/***
 * DAO for the round
 */
const RoundDao = {
    async getRound(id) {
        const query = 'SELECT * FROM round WHERE id_round=?';
        return new Promise((resolve, reject) => {
            try {
                db.get(query, [id], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    if (row === undefined) {
                        resolve({error: 'Round not found.'});
                    } else {
                        resolve(mapRowsToRound(row));
                    }
                });
            } catch (err) { reject(err); }
        });
    },

    async setRound(round) {
        const query = 'INSERT INTO round (id_meme, punteggio) VALUES (?,?)';
        return new Promise((resolve, reject) => {
            try {
                db.run(query, [round.meme.id, round.isCorrect * 5], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID); // `this` si riferisce al contesto del database
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }
    ,

    async getRoundByGameplay(id_gameplay) {
        const query = `SELECT * 
                        FROM round 
                        WHERE id_round IN (SELECT id_round1 FROM gameplay WHERE id_gameplay = ?)
                        OR id_round IN (SELECT id_round2 FROM gameplay WHERE id_gameplay = ?)
                        OR id_round IN (SELECT id_round3 FROM gameplay WHERE id_gameplay = ?)
                        `;
        return new Promise((resolve, reject) => {
            try {
                db.all(query, [id_gameplay, id_gameplay, id_gameplay], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRowsToRound(rows));
                    }
                });
            } catch (err) { reject(err); }      
        });
    }
};

export default RoundDao;

