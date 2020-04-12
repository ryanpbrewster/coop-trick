import firebase from "firebase/app";
import "firebase/firestore";
import {
  GameState,
  User,
  WaitingGameState,
  PlayingGameState,
  Word
} from "./models";
import { mkNonce, dealCards, dealMissions } from "./utils";

const CONFIG = {
  apiKey: "AIzaSyCtk7lEaSVeYtpz2DjrFqYByCz_fEqm1nA",
  authDomain: "coop-trick.firebaseapp.com",
  projectId: "coop-trick",
  storageBucket: "coop-trick.appspot.com",
};

type Unsubscribe = () => void;
export class FirebaseService {
  constructor(private readonly app: firebase.app.App) {}

  watchGame(
    gameId: string,
    me: User,
    cb: (game: GameState) => void
  ): Unsubscribe {
    function wrapper(snap: firebase.firestore.DocumentSnapshot): void {
      const data = snap.data();
      if (data) {
        cb(data as GameState);
      }
    }
    const ref = this.app.firestore().collection('game').doc(gameId);
    const listener = ref.onSnapshot(wrapper);
    this.app.firestore().runTransaction(async (txn) => {
      console.log(`joining room ${gameId}`);
      const cur = await txn.get(ref);
      if (!cur.exists) {
        console.log("room doesn't exist, creating a lobby");
        const waiting: WaitingGameState = {
          id: gameId,
          state: "waiting",
          nonce: mkNonce(),
          players: [me, {id: "a", name: "a", icon: "A"}, {id: "b", name: "b", icon: "B"}, {id: "c", name: "c", icon: "C"}],
        };
        return txn.set(ref, waiting);
      }
      const data = cur.data()!;
      if (data.state !== "waiting") {
        console.log("game in progress, bailing");
        return;
      }
      const game = data as WaitingGameState;
      if (game.players.find((p) => p.id === me.id)) {
        console.log("already joined, bailing")
        return;
      }
      game.players.push(me);
      console.log("joining lobby");
      return txn.set(ref, data);
    });
    return listener;
  }

  startGame(game: WaitingGameState): void {
    const players = dealCards(game.players);
    const missions = dealMissions(3);
    const started: PlayingGameState = {
      id: game.id,
      state: "playing",
      nonce: mkNonce(),
      players,
      missions,
    };
    const ref = this.app.firestore().collection('game').doc(game.id);
    this.app.firestore().runTransaction(async (txn) => {
      const cur = await txn.get(ref);
      const data = cur.data();
      if (data && data.nonce === game.nonce) {
        return txn.set(ref, started);
      }
    });
  }

  revealWord(game: PlayingGameState, word: string): void {
    const ref = this.app.firestore().collection('game').doc(game.id);
    this.app.firestore().runTransaction(async (txn) => {
      const cur = await txn.get(ref);
      const data = cur.data();
      if (data && data.nonce === game.nonce) {
        data.nonce = mkNonce();
        data.words.find((w: Word) => w.value === word).revealed = true;
        return txn.set(ref, data);
      }
    });
  }
}
let cached: FirebaseService | null = null;
export function useFirebase(): FirebaseService {
  if (!cached) {
    const app = firebase.initializeApp(CONFIG);
    cached = new FirebaseService(app);
  }
  return cached;
}