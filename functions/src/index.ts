import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

class User {
  uid: string;
  active: boolean;
  name: string;
  score: number;
}

admin.initializeApp((functions.config() as any).firebase);

const db = admin.database();
const store = admin.firestore();
const game = db.ref('game');
const queue = db.ref('queue');

exports.turnStart = functions.https.onRequest(async (request, response) => {
  const user = await getUser(request);

  removePreviousPlayersFromQueue(user);
  setTopOfQueuePlaying(user);

  response.send('turn started');
});

exports.move = functions.https.onRequest(async (request, response) => {
  const user = await getUser(request);
  setGameState(request);
  updateScore(user, request);
  fillQueue();

  response.send('moved');
});

exports.refreshQueue = functions.https.onRequest(async (request, response) => {
  fillQueue();
  response.send('filled');
});

async function getUser(request: Request): Promise<User> {
  // console.log(request.query);
  // console.log(request.body);
  const path = 'users/' + request.query.userId;

  const snapshot = await store
    .collection('users')
    .doc(request.query.userId)
    .get();
  return snapshot.data() as any;
}

async function fillQueue() {
  const snapshot = await queue.once('value');
  const newQueue = snapshot.val() || [];
  const userSnapshots = await store.collection('users').get();
  const users: User[] = [];
  userSnapshots.forEach(sn => users.push(sn.data() as any));
  if (newQueue.length < 5) {
    newQueue.push(users[Math.floor(Math.random() * users.length)]);
  }
  queue.set(newQueue);
}

function setGameState(request: Request) {
  const gameState = request.body;
  game.set(gameState.gameState);
}

function updateScore(user: User, request: Request) {
  const gameState = request.body;
  const additionalScore = gameState.additionalScore;
  db.ref(`users/${user.uid}/score`).set(user.score + additionalScore);
}

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
