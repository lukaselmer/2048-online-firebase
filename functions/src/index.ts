import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.database();
const game = db.ref('game');
const queue = db.ref('queue');
const users = db.ref('users');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

class AuthenticatedRequest extends Request {
  user: admin.auth.DecodedIdToken;
}

type User = admin.auth.DecodedIdToken;

admin.initializeApp((functions.config() as any).firebase);
// tslint:disable-next-line:no-var-requires
const express = require('express');
// tslint:disable-next-line:no-var-requires
const cookieParser = require('cookie-parser')();
// tslint:disable-next-line:no-var-requires
const cors = require('cors')({ origin: true });
const app = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req: any, res: any, next: any) => {
  console.log('Check if request is authorized with Firebase ID token');

  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !req.cookies.__session
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      console.log('ID Token correctly decoded', decodedIdToken);
      req.user = decodedIdToken;
      next();
    })
    .catch(error => {
      console.error('Error while verifying Firebase ID token:', error);
      res.status(403).send('Unauthorized');
    });
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);

exports.turnStart = functions.https.onRequest(async (req, response) => {
  const request: AuthenticatedRequest = req as any as AuthenticatedRequest;
  console.log(request);

  const user = await getUser(request);
  console.log(user);

  removePreviousPlayersFromQueue(user);
  setTopOfQueuePlaying(user);

  response.send('turn started');
});

exports.move = functions.https.onRequest((req, response) => {
  const request: AuthenticatedRequest = req as any as AuthenticatedRequest;
  const user = getUser(request);
  setGameState(request);
  updateScore(user, request);
  fillQueue();

  console.log(request);
  response.send('moved');
});

exports.refreshQueue = functions.https.onRequest((req, response) => {
  const request: AuthenticatedRequest = req as any as AuthenticatedRequest;
  fillQueue();

  console.log(request);
  response.send('filled');
});

function getUser(request: AuthenticatedRequest): admin.auth.DecodedIdToken {
  return request.user;
}

function fillQueue() {
  queue.once('value').then(snapshot => {
    snapshot.val();
    console.log();
  });
}

function setGameState(request: AuthenticatedRequest) {}

function updateScore(user: any, request: AuthenticatedRequest) {}

function removePreviousPlayersFromQueue(user: User) {}

function setTopOfQueuePlaying(user: User) {}
