import firebase from "firebase/app";
import "firebase/firestore";
import {
  GameState,
  User,
  WaitingGameState,
  PlayingGameState,
  Card,
  Cards,
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
      turn: 0,
      missions,
      trick: [],
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

  assignMission(game: PlayingGameState, missionIdx: number): void {
    console.log(`assigning mission ${missionIdx} to player ${game.players[game.turn].user.name}`);
    const ref = this.app.firestore().collection('game').doc(game.id);
    this.app.firestore().runTransaction(async (txn) => {
      const data = (await txn.get(ref)).data();
      if (data && data.nonce === game.nonce) {
        const cur = data as PlayingGameState;
        if (missionIdx >= game.missions.length) throw Error(`no mission #${missionIdx}`);

        cur.nonce = mkNonce();
        cur.players[game.turn].missions.push(game.missions[missionIdx])
        cur.turn = game.missions.length === 1 ? 0 : (game.turn + 1) % game.players.length;
        cur.missions = [...game.missions.slice(0, missionIdx), ...game.missions.slice(missionIdx+1)];
        return txn.set(ref, cur);
      }
    });
  }

  playCard(game: PlayingGameState, card: Card): void {
    console.log(`player ${game.players[game.turn].user.name} is playing card ${JSON.stringify(card)}`);
    const ref = this.app.firestore().collection('game').doc(game.id);
    this.app.firestore().runTransaction(async (txn) => {
      const data = (await txn.get(ref)).data();
      if (data && data.nonce === game.nonce) {
        const cur = data as PlayingGameState;
        const cardIdx = cur.players[cur.turn].dealt.findIndex((c) => Cards.equal(c.card, card));

        cur.nonce = mkNonce();
        cur.players[game.turn].dealt[cardIdx] = {card, played: true};
        cur.turn = (game.turn + 1) % game.players.length;
        cur.trick.push(card);
        return txn.set(ref, cur);
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