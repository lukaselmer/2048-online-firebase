import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

type User = admin.auth.DecodedIdToken;

admin.initializeApp((functions.config() as any).firebase);

const db = admin.database();
const game = db.ref('game');
const queue = db.ref('queue');
const users = db.ref('users');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// tslint:disable-next-line:no-var-requires
// const express = require('express');
// tslint:disable-next-line:no-var-requires

exports.turnStart = functions.https.onRequest(async (request, response) => {
  const user = await getUser(request);
  console.log(user);

  removePreviousPlayersFromQueue(user);
  setTopOfQueuePlaying(user);

  response.send('turn started');
});

exports.move = functions.https.onRequest((request, response) => {
  const user = getUser(request);
  setGameState(request);
  updateScore(user, request);
  fillQueue();

  response.send('moved');
});

exports.refreshQueue = functions.https.onRequest((request, response) => {
  fillQueue();

  response.send('filled');
});

function getUser(request: Request): Promise<any> {
  console.log(request.params);
  console.log(request.body);

  // TODO: get id from request
  return users.child('234').once('value');
  // return getUserFromReqest(request);
}

function fillQueue() {
  queue.once('value').then(snapshot => {
    snapshot.val();
  });
}

function setGameState(request: Request) {
  const gameState = request.body;
  game.set(gameState);
}

function updateScore(user: any, request: Request) {}

function removePreviousPlayersFromQueue(user: User) {}

function setTopOfQueuePlaying(user: User) {}

// function getUserFromReqest(req: any) {
//   console.log('Check if request is authorized with Firebase ID token');

//   if (
//     (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
//     !req.cookies.__session
//   ) {
//     console.error(
//       'No Firebase ID token was passed as a Bearer token in the Authorization header.',
//       'Make sure you authorize your request by providing the following HTTP header:',
//       'Authorization: Bearer <Firebase ID Token>',
//       'or by passing a "__session" cookie.'
//     );
//     res.status(403).send('Unauthorized');
//     return;
//   }

//   let idToken;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     console.log('Found "Authorization" header');
//     // Read the ID Token from the Authorization header.
//     idToken = req.headers.authorization.split('Bearer ')[1];
//   } else {
//     console.log('Found "__session" cookie');
//     // Read the ID Token from cookie.
//     idToken = req.cookies.__session;
//   }
//   admin
//     .auth()
//     .verifyIdToken(idToken)
//     .then(decodedIdToken => {
//       console.log('ID Token correctly decoded', decodedIdToken);
//       req.user = decodedIdToken;
//       next();
//     })
//     .catch(error => {
//       console.error('Error while verifying Firebase ID token:', error);
//       res.status(403).send('Unauthorized');
//     });
// }
