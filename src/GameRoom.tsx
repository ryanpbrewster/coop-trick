import React, { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { GameState } from "./models";
import { useFirebase } from "./fb";
import { User } from "./models";
import WaitingRoom from "./WaitingRoom";
import PlayingRoom from "./PlayingRoom";

const GAME_ID_REGEX = /^[A-Za-z0-9]+$/;
function SanitizedGameRoom() {
  const { gameId } = useParams();

  const id = localStorage.getItem("id");
  const name = localStorage.getItem("name");
  const icon = localStorage.getItem("icon");
  if (!gameId || !id || !name || !icon || !GAME_ID_REGEX.test(gameId)) {
    return <Redirect to="/" />;
  }

  const me: User = { id, name, icon };
  return <GameRoom gameId={gameId} me={me} />;
}

interface GameRoomProps {
  readonly gameId: string;
  readonly me: User;
}
function GameRoom({ gameId, me }: GameRoomProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const app = useFirebase();
  useEffect(() => {
    return app.watchGame(gameId, me, setGame);
  }, [app, gameId, me]);

  if (!game) {
    return <p>Loading...</p>;
  }

  switch (game.state) {
    case "waiting":
      return <WaitingRoom me={me.id} game={game} />;
    case "playing":
      return <PlayingRoom me={me.id} game={game} />;
    default:
      throw Error(`unknown game state: ${JSON.stringify(game)}`);
  }
}

export default SanitizedGameRoom;
