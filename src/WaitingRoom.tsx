import React from "react";
import { useFirebase } from "./fb";
import { BigButton } from "./Common";
import styled from "styled-components";
import { WaitingGameState } from "./models";

interface WaitingRoomProps {
  readonly me: string;
  readonly game: WaitingGameState;
}
function WaitingRoom({ me, game }: WaitingRoomProps) {
  const app = useFirebase();

  const playerContent = Object.entries(game.players).map(([id, player]) => {
    return <PlayerCard key={id}>{player.name}</PlayerCard>;
  });
  const disabled = Object.keys(game.players).length < 2;
  return (
    <WaitingPlayers>
      <BigButton onClick={() => app.startGame(game)} disabled={disabled}>
        Start
      </BigButton>
      {playerContent}
    </WaitingPlayers>
  );
}

const WaitingPlayers = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const PlayerCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 24px;
  width: 96px;
  border-radius: 12px;
`;

export default WaitingRoom;
