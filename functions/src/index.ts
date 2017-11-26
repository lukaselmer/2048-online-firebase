import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.turnStart = functions.https.onRequest((request, response) => {
  console.log(request);

  const user = getUser(request);
  removePreviousPlayersFromQueue(user);
  setTopOfQueuePlaying(user);

  response.send('turn started');
});

exports.move = functions.https.onRequest((request, response) => {
  const user = getUser(request);
  setGameState(request);
  updateScore(user, request);
  fillQueue();

  console.log(request);
  response.send('moved');
});

exports.refreshQueue = functions.https.onRequest((request, response) => {
  fillQueue();

  console.log(request);
  response.send('filled');
});

function getUser(request: Request) {
  // TODO
}

function fillQueue() {}

function setGameState(request: Request) {}

function updateScore(user: any, request: Request) {}

function removePreviousPlayersFromQueue(user) {}

function setTopOfQueuePlaying(user) {}
