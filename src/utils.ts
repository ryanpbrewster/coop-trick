import { Card, DealtCard, User, Player, Mission, Cards, Suits, Nonce } from "./models";

export function mkNonce(): Nonce {
  return Math.random()
    .toString(36)
    .substring(2);
}

function shuffle<T>(xs: T[]): void {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = xs[i];
    xs[i] = xs[j];
    xs[j] = tmp;
  }
}

export function mkDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of Suits.ALL) {
    const count = suit === "trump" ? 4 : 9;
    for (let rank = 1; rank <= count; rank++) {
      cards.push({ rank, suit });
    }
  }
  shuffle(cards);
  return cards;
}

export function dealCards(users: User[]): Player[] {
  if (users.length < 4) throw Error("need 4 players");
  const deck: Card[] = mkDeck();
  const cards: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    cards[i % 4].push(deck[i]);
  }
  const players = users.slice(0, 4).map((user, idx) => mkPlayer(user, cards[idx]));

  // Move the leader (i.e., the player with the Trump 4) to the front.
  const leader = players.findIndex((player) => player.dealt.find((d) => Cards.isTrump4(d.card)));
  return [...players.slice(leader), ...players.slice(0, leader)];
}

function mkPlayer(user: User, cards: Card[]): Player {
  const dealt: DealtCard[] = cards.map((card) => ({ card, played: false }));
  return { user, dealt, missions: [] };
}

export function dealMissions(count: number): Mission[] {
  const cards = mkDeck().filter((card) => card.suit !== 'trump');
  const missions: Mission[] = [];
  for (let i=0; i < count; i++) {
    missions.push({
      type: 'card',
      card: cards[i],
    });
  }
  return missions;
}