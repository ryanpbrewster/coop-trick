import React from "react";
import styled from "styled-components";
import * as models from "./models";
import { useFirebase } from "./fb";

interface PlayingRoomProps {
  readonly me: models.UserId;
  readonly game: models.PlayingGameState;
}
function PlayingRoom({ me, game }: PlayingRoomProps) {
  const myIdx = game.players.findIndex((p) => p.user.id === me);
  const players = [...game.players.slice(myIdx), ...game.players.slice(0, myIdx)];
  const playerContent = players.map((player, idx) => {
    return <Player key={idx} idx={idx} player={player} me={me} game={game} />;
  });
  const content = game.missions.length > 0 ? <Missions me={me} game={game} /> : <Trick game={game} />;
  return <GameBoard>
    {playerContent}
    {content}
  </GameBoard>;
}

interface PlayerProps {
  readonly idx: number;
  readonly player: models.Player;
  readonly me: models.UserId;
  readonly game: models.PlayingGameState;
}
function Player({ idx, player, me, game }: PlayerProps) {
  let gridArea;
  let transform;
  switch (idx) {
    case 0: gridArea = "3/2"; break;
    case 1: gridArea = "2/1"; transform="rotate(-90deg)"; break;
    case 2: gridArea = "1/2"; break;
    case 3: gridArea = "2/3"; transform="rotate(+90deg)"; break;
  }
  const active = game.players[game.turn].user.id === player.user.id;
  return <PlayerWrapper style={{gridArea, transform}}>
    <PlayerName active={active}>{player.user.name}</PlayerName>
    <Hand game={game} dealt={player.dealt} revealed={player.user.id === me} />
    <MissionsAndHints>
      <DealtMissions missions={player.missions} />
      <Hint hint={null} />
    </MissionsAndHints>
  </PlayerWrapper>;
}

const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

interface PlayerNameProps {
  readonly active: boolean;
}
const PlayerName = styled.p<PlayerNameProps>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-weight: ${({active}) => active ? "bold" : "normal"};
`;

interface HandProps {
  readonly dealt: models.DealtCard[];
  readonly revealed: boolean;
  readonly game: models.PlayingGameState;
}
function Hand({ dealt, revealed, game }: HandProps) {
  const app = useFirebase();
  models.DealtCards.sort(dealt);
  const cards = dealt.map((d, idx) => {
    return <DealtCard key={idx} card={revealed ? d.card : null} onClick={() => app.playCard(game, d.card)}/>;
  });
  return <HandWrapper>
    {cards}
  </HandWrapper>
}

const HandWrapper = styled.div`
  grid-row: 2;
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

interface DealtCardProps {
  readonly card: models.Card | null;
  readonly onClick?: () => void;
}
function DealtCard({ card, onClick }: DealtCardProps) {
  return (
    <DealtCardWrapper suit={card?.suit} onClick={onClick} clickable={!!onClick}>
      <p>{card?.rank}</p>
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
  readonly suit?: models.Suit;
  readonly clickable: boolean;
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
  background-color: ${({suit}) => suit && models.Suits.color(suit)};
  cursor: ${({clickable}) => clickable ? "pointer" : "not-allowed"};
`;

interface MissionsProps {
  readonly me: models.UserId;
  readonly game: models.PlayingGameState;
}
function Missions({ me, game }: MissionsProps) {
  const app = useFirebase();
  function clickFn(idx: number) {
    // if (game.players[game.turn].user.id === me) {
      return () => app.assignMission(game, idx);
    // }
  }
  const content = game.missions.map((mission, idx) => {
    return <DealtCard key={idx} card={mission.card} onClick={clickFn(idx)} />
  });
  return <MissionsWrapper>
    {content}
  </MissionsWrapper>;
}
const MissionsWrapper = styled.div`
  grid-area: 2/2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  opacity: 0.7;
`;

interface DealtMissionsProps {
  readonly missions: models.Mission[];
}
function DealtMissions({ missions }: DealtMissionsProps) {
  const content = missions.map((mission, idx) => {
    return <DealtCard key={idx} card={mission.card} />
  });
  return <DealtMissionsWrapper>
    {content}
  </DealtMissionsWrapper>;
}
const DealtMissionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin-top: 4px;
  padding: 8px;
  border: solid 1px;
  min-width: 40px;
`;

interface HintProps {
  readonly hint: null;
}
function Hint({ hint }: HintProps) {
  return <HintWrapper><DealtCard card={hint} /></HintWrapper>;
}
const HintWrapper = styled.div`
  margin-top: 4px;
  padding: 8px;
  border: solid 1px;
`;

export const MissionsAndHints = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface TrickProps {
  readonly game: models.PlayingGameState;
}
function Trick({ game }: TrickProps) {
  const content = game.trick.map((card, idx) => {
    return <DealtCard key={idx} card={card} />
  });
  return <TrickWrapper>
    {content}
  </TrickWrapper>;
}
const TrickWrapper = styled.div`
  grid-area: 2/2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  opacity: 0.7;
`;

export default PlayingRoom;
