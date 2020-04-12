import React from "react";
import styled from "styled-components";
import { UserMap, TeamMap, Team, Label } from "./models";

export const BigButton = styled.button`
  min-height: 48px;
  min-width: 96px;
  border-radius: 16px;
  margin: 24px;
  font-size: 32px;

  &:focus {
    outline: none;
  }
`;

export function revealedColor(label: Label): string {
  switch (label) {
    case "red":
      return "rgb(245, 142, 135)";
    case "blue":
      return "rgb(150, 177, 255)";
    case "gray":
      return "rgb(241, 238, 156)";
    case "black":
      return "rgb(0, 0, 0)";
  }
}

interface TeamRosterProps {
  readonly players: UserMap;
  readonly teams: TeamMap;
}
export function TeamRoster({ players, teams }: TeamRosterProps) {
  const content = Object.values(players).map(player => {
    return (
      <PlayerCard key={player.id} team={teams[player.id]}>
        <PlayerIcon>{player.icon}</PlayerIcon>
        <p>{player.name}</p>
      </PlayerCard>
    );
  });
  return <TeamRosterWrapper>{content}</TeamRosterWrapper>;
}

const TeamRosterWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

interface PlayerCardProps {
  readonly team: Team;
}
const PlayerCard = styled.div<PlayerCardProps>`
  grid-column: ${({ team }) => (team === "red" ? 1 : 2)};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: ${({ team }) => revealedColor(team)};
  padding: 4px;
  border: solid 1px;
`;

const PlayerIcon = styled.div`
  font-size: 24px;
  width: 24px;
  font-family: monospace;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
`;
