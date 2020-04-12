import React from "react";
import styled from "styled-components";
import * as models from "./models";

interface PlayingRoomProps {
  readonly me: models.UserId;
  readonly game: models.PlayingGameState;
}
function PlayingRoom({ me, game }: PlayingRoomProps) {
  const players = game.players.map((player, idx) => {
    return <Player key={idx} idx={idx} player={player} />;
  });
  return <GameBoard>{players}</GameBoard>;
}

interface PlayerProps {
  readonly idx: number;
  readonly player: models.Player;
}
function Player({ idx, player }: PlayerProps) {
  let gridArea;
  let transform;
  switch (idx) {
    case 0: gridArea = "3/2"; break;
    case 1: gridArea = "2/1"; transform="rotate(-90deg)"; break;
    case 2: gridArea = "1/2"; break;
    case 3: gridArea = "2/3"; transform="rotate(+90deg)"; break;
  }
  return <PlayerWrapper style={{gridArea, transform}}>
    <p>{player.user.name}</p>
    <Hand dealt={player.dealt} />
  </PlayerWrapper>;
}

const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

interface HandProps {
  readonly dealt: models.DealtCard[];
}
function Hand({ dealt }: HandProps) {
  models.DealtCards.sort(dealt);
  const cards = dealt.map((d, idx) => {
    return <DealtCard key={idx} card={d.card} />;
  });
  return <HandWrapper>
    {cards}
  </HandWrapper>
}

const HandWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

interface DealtCardProps {
  readonly card: models.Card;
}
function DealtCard({ card }: DealtCardProps) {
  return (
    <DealtCardWrapper suit={card.suit}>
      <p>{card.rank}</p>
    </DealtCardWrapper>
  );
}

const GameBoard = styled.div`
  height: 100%;
  display: grid;
  grid-template: 1fr 3fr 1fr / 1fr 3fr 1fr;
  padding: 100px;
`;

interface DealtCardWrapperProps {
  readonly suit: models.Suit;
}
const DealtCardWrapper = styled.div<DealtCardWrapperProps>`
  width: 40px;
  height: 60px;
  border-radius: 8px;
  border: solid 1px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  font-size: 24px;
  font-weight: bold;
  background-color: ${({suit}) => models.Suits.color(suit)}
`;


export default PlayingRoom;
