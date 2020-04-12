export type GameState = WaitingGameState | PlayingGameState | OverGameState;

export type GameId = string;
export interface WaitingGameState {
  readonly id: GameId;
  readonly state: "waiting";
  readonly nonce: string;
  readonly players: User[];
}

export interface OverGameState {
  readonly id: GameId;
  readonly state: "over";
}

export interface PlayingGameState {
  readonly id: GameId;
  readonly state: "playing";
  readonly nonce: string;
  readonly players: Player[];
  readonly missions: Mission[];
}

export interface Player {
  readonly user: User;
  readonly dealt: DealtCard[];
  readonly missions: Mission[];
}

export interface Word {
  readonly value: string;
  readonly revealed: boolean;
  readonly label: Label;
}
export type Label = Team | "gray" | "black";

export type UserId = string;
export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly icon: string;
}
export type UserMap = { [id: string]: User };

export type Team = "red" | "blue";
export type TeamMap = { [id: string]: Team };

export type Suit = "red" | "green" | "blue" | "yellow" | "trump";

export class Suits {
  static ALL: Suit[] = ["red", "green", "blue", "yellow", "trump"];

  static color(suit: Suit): string {
    switch (suit) {
      case 'blue': return "blue";
      case 'green': return "green";
      case 'red': return "red";
      case 'yellow': return "yellow";
      case 'trump': return "white";
    }
  }
}

export interface Card {
  readonly suit: Suit;
  readonly rank: number;
}

export class Cards {
  static isTrump4(card: Card): boolean {
    return card.suit === 'trump' && card.rank === 4;
  }
}

export interface DealtCard {
  readonly card: Card;
  readonly played: boolean;
}

export class DealtCards {
  static sort(cards: DealtCard[]): void {
    cards.sort((a, b) => {
      if (a.card.suit !== b.card.suit) {
        return Suits.ALL.indexOf(a.card.suit) - Suits.ALL.indexOf(b.card.suit);
      }
      return a.card.rank - b.card.rank;
    });
  }
}

export type Mission = CardMission;
export interface CardMission {
  readonly type: 'card';
  readonly card: Card;
}