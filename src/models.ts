export type GameState = WaitingGameState | PlayingGameState | OverGameState;

export type GameId = string;
export interface WaitingGameState {
  readonly id: GameId;
  readonly state: "waiting";
  readonly nonce: string;
  readonly players: UserMap;
}

export interface OverGameState {
  readonly id: GameId;
  readonly state: "over";
}

export interface PlayingGameState {
  readonly id: GameId;
  readonly state: "playing";
  readonly nonce: string;
  readonly players: UserMap;
  readonly teams: TeamMap;
  readonly words: Word[];
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

export type Role = "leader" | "guesser";
