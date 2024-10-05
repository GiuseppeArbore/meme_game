import Meme from './models/Meme.js';
import Descrizioni from './models/Didascalie.js';
import Gameplay from './models/Gameplay.js';
import Round from './models/Round.js';


const SERVER_URL = 'http://localhost:3001/api';

/***
 * This function returns a random meme from the server.
 */
const getRandomMeme = async () => {
    const response = await fetch(SERVER_URL + '/single-round-meme');
    if (response.ok) {
        const data = await response.json();
        return new Meme(data.meme.id, data.meme.url);
    } else {
        throw new Error('Internal server error');
    }
};

/***
 * This function returns a meme from the server by id.
 * @param memeId
 * @returns {Promise<Meme>}
 * @throws Error
 */
const getMemeById = async (memeId) => {
    const response = await fetch(SERVER_URL + `/memes/${memeId}`);
    if (response.ok) {
        const data = await response.json();
        return new Meme(data.id, data.immagine);
    } else {
        throw new Error('Internal server error');
    }
}

/***
 * This function returns the captions for a meme.
 * @param memeId
 * @returns {Promise<Descrizioni[]>}
 * @throws Error
 **/

const getCaptionsForMeme = async (memeId) => {
    const response = await fetch(SERVER_URL + `/captionsMeme/${memeId}`);
    if (response.ok) {
        const captionsJson = await response.json();
        return captionsJson.map(c => new Descrizioni(c.id, c.text, true));
    } else {
        throw new Error('Internal server error');
    }
};

/***
 * This function returns the rounds for a game.
 * @param gameId
 * @returns {Promise<Round[]>}
 * @throws Error
 */
const getRoundsByGameiD = async (gameId) => {
    const response = await fetch(SERVER_URL + `/games/${gameId}/rounds`);
    if (response.ok) {
        const roundsJson = await response.json();
        return roundsJson.map(r => new Round(r.id_round, r.id_meme, r.punteggio));
    } else {
        throw new Error('Internal server error');
    }
};



/**
 * This function is used to log-in the user.
 * It returns a JSON object with the user info.
 * @param credentials
 * @returns {Promise<any>}
 * @throws Error
 */
const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared. It is included in all the authenticated APIs.
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
        .then(response => response.json());
};



/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    }).then(handleInvalidResponse)
        .then(response => response.json());
};

/**
 * This function destroy the current user's session (executing the log-out).
 */
const logOut = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    }).then(handleInvalidResponse);
}

/***
 * This function returns the games of a user.
 * @param userId
 * @returns {Promise<Gameplay[]>}
 * @throws Error
 */
const getGamesByUserId = async (userId) => {
  const response = await fetch(SERVER_URL + `/games/user/${userId}`, {
      method: 'GET',
      credentials: 'include'
  });
  if (response.ok) {
      const gamesJson = await response.json();

      return gamesJson.map(g => new Gameplay(g.id_gameplay, g.id_utente, g.round1, g.round2, g.round3, g.punteggio, g.data));
  } else if (response.status === 401) {
      throw new UnauthorizedError('Unauthorized access');
  } else {
      throw new Error('Internal server error');
  }
};

/**
 * this function returns a single round 
 * @returns {Promise<{meme: Meme, captions: Descrizioni[]}>}
 * @throws Error
 */
const getSingleRoundMeme = async () => {
    const response = await fetch(SERVER_URL + '/single-round-meme');
    if (response.ok) {
        const data = await response.json();
        const meme = new Meme(data.meme.id, data.meme.immagine);
        const captions = data.captions.map(c => new Descrizioni(c.id, c.text));
        return { meme, captions };
    } else {
        throw new Error('Internal server error');
    }
};

/***
 * this function returns the correct captions for a meme
 * @param memeId
 * @returns {Promise<Descrizioni[]>}
 * @throws Error
 */
const getCorrectCaptions = async (memeId) => {
    const response = await fetch(SERVER_URL + '/get-correct-captions/' + memeId);
    if (response.ok) {
        const data = await response.json();
        const captions = data.map(c => new Descrizioni(c.id, c.text));

        return captions;
    } else {
        throw new Error('Internal server error');
    }
};


/***
 * this function returns a game -> multi rounf
 * @returns {Promise<{memes: Meme[], mscaptions: Descrizioni[]}>}
 * @throws Error
 */
const getMultiRoundMeme = async () => {
    let memes = [];
    let mscaptions = [];
    const response = await fetch(SERVER_URL + `/multi-round-meme`, {
        method: 'GET',
        credentials: 'include'
    });
    if (response.ok) {
        const data = await response.json();
        data.forEach(d => {
            memes.push(new Meme(d.meme.id, d.meme.immagine));
            mscaptions.push(d.captions.map(c => new Descrizioni(c.id, c.text)));
        });
    }
    else if (response.status === 401) {
        throw new UnauthorizedError('Unauthorized access');
    } else {
        throw new Error('Internal server error');
    }
    return {memes, mscaptions};
};

/***
 * this function creates a game in the db
 * @param userId
 * @param rounds
 * @param finalPoints
 * @returns {Promise<void>}
 * @throws Error
 */

const createMultiRoundGame = async (userId, rounds, finalPoints) => {
    try {
        const response = await fetch(SERVER_URL + '/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId, rounds, finalPoints }),
        });

        if (!response.ok) {
            throw new Error('Internal server error');
        }
    } catch (error) {
        console.error('Error in createMultiRoundGame:', error);
        throw error;
    }
}


function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1) {
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    if (response.status === 401) {
        throw new UnauthorizedError('Unauthorized access');
    }
    return response;
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.response = { status: 401 };
    }
}


const API = { getRandomMeme, getCaptionsForMeme, logIn, getUserInfo, logOut, getSingleRoundMeme, getCorrectCaptions, getMultiRoundMeme, createMultiRoundGame, getGamesByUserId, getRoundsByGameiD, getMemeById};
export default API;