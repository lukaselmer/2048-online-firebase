import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.turnStart = functions.https.onRequest((request, response) => {
  const user = getUser(request);
  console.log(request);
  response.send('turn started');
});

exports.move = functions.https.onRequest((request, response) => {
  console.log(request);
  response.send('moved');
});

exports.gameOver = functions.https.onRequest((request, response) => {
  console.log(request);
  response.send('game over');
});

function getUser(request: Request) {
  // TODO
}
