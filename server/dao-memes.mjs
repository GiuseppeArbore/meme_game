import db from "./db.mjs";
import Meme from "./models/meme-model.mjs";

/***
 * Function to map the rows of the database to the memes
 */
function mapRowsToMemes(rows){
    return rows.map(row => new Meme(row.id, row.immagine));
}

/***
 * DAO for the memes
 */
const MemeDao = {
    async getMeme(id) {
        const query = 'SELECT * FROM meme WHERE id=?';
        return new Promise((resolve, reject) => {
            try {
                db.get(query, [id], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    if (row === undefined) {
                        resolve({error: 'Meme not found.'});
                    } else {
                        resolve(row);
                    }
                });
            } catch (err) { reject(err); }  
        });
    },

    async getMemesRandom() {
        const query = 'SELECT * FROM meme ORDER BY RANDOM() LIMIT 3';
        return new Promise((resolve, reject) => {
            try {
                db.all(query, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRowsToMemes(rows));
                    }
                });
            } catch (err) { reject(err); }
        });
    },

    async getMemeRandom() {
        const query = 'SELECT * FROM meme ORDER BY RANDOM() LIMIT 1';
        return new Promise((resolve, reject) => {
            try {
                db.get(query, (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    if (row === undefined) {
                        resolve({error: 'No memes available.'});
                    } else {
                        resolve(new Meme(row.id, row.immagine));
                    }
                });
            } catch (err) { reject(err); }
        });
    }
};



export default MemeDao;