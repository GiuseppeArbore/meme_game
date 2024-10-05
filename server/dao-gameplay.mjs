import  db from './db.mjs';
import Gameplay from './models/game-model.mjs';

/***
 *  Function to map the rows of the database to the games
 */

function mapRowsToGames(rows) {
    return rows.map(row => new
        Gameplay(row.id_gameplay, row.id_user, row.punteggio, row.id_round1, row.id_round2, row.id_round3, row.date)
    );
    
}

/***
 * DAO for the gameplay
 */
const GameplayDao = {
    async getGameplayByUser(id_user) {
        const query = 'SELECT * FROM gameplay WHERE id_utente=?';
        return new Promise((resolve, reject) => {
            try {
                db.all(query, [id_user], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRowsToGames(rows));
                    }
                });
            } catch (err) { reject(err); }
        });
    },

    async setGameplay(id_round1, id_round2, id_round3, finalPoints, data, id_user) {
        const query = 'INSERT INTO gameplay (id_round1, id_round2, id_round3, punteggio, date, id_utente) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            try {
                db.run(query, [id_round1, id_round2, id_round3,finalPoints, data, id_user], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                })
            } catch (err) { reject(err); }
        });
    }
};

export default GameplayDao;

