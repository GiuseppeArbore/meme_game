// imports
import express from 'express';
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import { check, validationResult } from 'express-validator'; // validation middleware

// DAO imports
import MemeDao from './dao-memes.mjs';
import DidascaliaDao from './dao-didascalie.mjs';
import UserDao from "./dao-users.mjs";
import RoundDao from './dao-round.mjs';


import GameplayDao from './dao-gameplay.mjs';


//passport imports
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';


// create the DAOs
const userDao = new UserDao();


// init express
const app = express();
app.use(morgan('dev'));
app.use(express.json()); //strumento di gestione dei json

// Servire file statici
app.use(express.static('public'));

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true   //serve al server per capire che può accettare i cookie anche se arrivano da un'altra origine
};
app.use(cors(corsOptions));

const port = 3001;

/** configurazione di passport **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); 
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { 
  return userDao.getUserById(user.id).then(user => cb(null, user)).catch(err => cb(err, null));
});

/*** Utility Functions ***/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


// Middleware di logging per tracciare tutte le richieste
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/*** Users APIs ***/

// POST /api/sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// DELETE /api/sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});


/** API GAMEPLAY */

// POST /api/check-captions

app.post('/api/check-captions', async (req, res) => {
  try {
    const { memeId, captionId } = req.body;
    
    // Implementa la logica per verificare la didascalia
    const isCorrect = await DidascaliaDao.checkDidascalia(memeId, captionId);
    res.json({ isCorrect });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/get-correct-captions
app.get('/api/get-correct-captions/:memeId', async (req, res) => {
  try {
    const memeId = req.params.memeId;

    const captions = await DidascaliaDao.getAllDidascalieCorrette(memeId);

    res.json(captions);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of correct captions: ${err}` });
  }
});


app.get('/api/memes/:memeId', async (req, res) => { 
  try {
    const memeId = req.params.memeId;

    const meme = await MemeDao.getMeme(memeId);

    res.json(meme);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of meme: ${err}` });
  }
});


/*** Sezione API per il Gioco non loggato ***/
app.get('/api/single-round-meme', async (req, res) => {
  try {
    const meme = await MemeDao.getMemeRandom();
    const captions = await DidascaliaDao.get7DidascalieRandom(meme.id);
    res.json({ meme: meme, captions: captions });
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of meme: ${err}` });
  }
});


/*** Sezione API per il Gioco loggato */
// 3 meme
app.get('/api/multi-round-meme', isLoggedIn, async (req, res) => {
  try {
    const memes_caption = [];
    const memes = await MemeDao.getMemesRandom();
    const caption1 = await DidascaliaDao.get7DidascalieRandom(memes[0].id);
    const caption2 = await DidascaliaDao.get7DidascalieRandom(memes[1].id);
    const caption3 = await DidascaliaDao.get7DidascalieRandom(memes[2].id);
    memes_caption.push({ meme: memes[0], captions: caption1 });
    memes_caption.push({ meme: memes[1], captions: caption2 });
    memes_caption.push({ meme: memes[2], captions: caption3 });

    res.json(memes_caption);
  } catch (err) {
    res.status(500).send(err);
  }
});


//save the 3 rounds 
app.post('/api/games', isLoggedIn, [
  check('userId').isInt(),
  check('rounds').isArray(),
  check('rounds.*.meme.id').isInt(),
    validateUserId
], async (req, res) => {
  const invalidFields = validationResult(req);

  if (!invalidFields.isEmpty()) {
    return onValidationErrors(invalidFields, res);
  }
  try {
    const { userId, rounds, finalPoints } = req.body;
    const round1= await RoundDao.setRound(rounds[0]);
    const round2= await RoundDao.setRound(rounds[1]);
    const round3= await RoundDao.setRound(rounds[2]);
    
    const date= new Date().toISOString();
    const game = await GameplayDao.setGameplay(round1, round2, round3, finalPoints, date, userId);

    res.status(201).json(round1);
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of multi-round game: ${err}` });
  }
});



/*** user games */
// Retrieve games played by userId
app.get('/api/games/user/:userId', isLoggedIn, async (req, res) => {
  try {
    const games = await GameplayDao.getGameplayByUser(req.params.userId);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of games: ${err}` });
  }
});

// Retrieve rounds by gameId
app.get('/api/games/:gameId/rounds', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const rounds = await RoundDao.getRoundByGameplay(gameId);
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ error: `Error fetching rounds: ${err.message}` });
  }
});


/*** Utility function */

//keep the errore message in response
const errorFormatter = ({ msg }) => {
  return msg;
};


//handle the validation error
const onValidationErrors = (validationResult, res) => {
  const errors = validationResult.formatWith(errorFormatter);
  return res.status(422).json({ validationErrors: errors.mapped() });
};

async function validateUserId(req, res, next) {
  const { userId } = req.body;
  try {
    const result = await userDao.getUserById(userId);
    if (result.error) {
      res.status(404).json(result).end();
    } else {
      next();
    }
  } catch (err) {
    res.status(503).json({ error: err.message }).end();
  }
}

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});