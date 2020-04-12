import React, { useState } from "react";
import styled from "styled-components";
import { BigButton, TeamRoster, revealedColor } from "./Common";
import * as models from "./models";
import { useFirebase } from "./fb";

interface PlayingRoomProps {
  readonly me: models.UserId;
  readonly game: models.PlayingGameState;
}
function PlayingRoom({ me, game }: PlayingRoomProps) {
  const players = game.players.map((player) => {
    return <Player player={player} />;
  });
  return <GameBoard>{players}</GameBoard>;
}

interface PlayerProps {
  readonly player: models.Player;
}
function Player({ player }: PlayerProps) {
  const cards = player.dealt;
  models.DealtCards.sort(cards);
  const hand = player.dealt.map((dealt, idx) => {
    return <DealtCard key={idx} dealt={dealt} />;
  });
  return <PlayerWrapper>
    <p>{player.user.name}</p>
    {hand}
  </PlayerWrapper>;
}

const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

interface DealtCardProps {
  readonly dealt: models.DealtCard;
}
function DealtCard({ dealt }: DealtCardProps) {
  return (
    <DealtCardWrapper suit={dealt.card.suit}>
      <p>{dealt.card.rank}</p>
    </DealtCardWrapper>
  );
}

const GameBoard = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px;
`;

interface DealtCardWrapperProps {
  readonly suit: models.Suit;
}
const DealtCardWrapper = styled.div<DealtCardWrapperProps>`
  width: 40px;
  height: 60px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  background-color: ${({suit}) => models.Suits.color(suit)}
`;


export default PlayingRoom;
