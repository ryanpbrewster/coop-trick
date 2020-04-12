import { Label, TeamMap, UserId, Word } from "./models";

export function mkNonce(): string {
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

export function splitIntoTeams(users: UserId[]): TeamMap {
  return Object.fromEntries(
    users.map((userId, idx) => [userId, idx % 2 === 0 ? "red" : "blue"])
  );
}

function randomLabels(): Label[] {
  const labels: Label[] = [];
  for (let i = 0; i < 9; i++) {
    labels.push("red");
  }
  for (let i = 0; i < 8; i++) {
    labels.push("blue");
  }
  for (let i = 0; i < 7; i++) {
    labels.push("gray");
  }
  for (let i = 0; i < 1; i++) {
    labels.push("black");
  }
  shuffle(labels);
  return labels;
}

export function mkWords(): Word[] {
  const chosen = new Set<string>();
  while (chosen.size < 25) {
    const idx = Math.floor(Math.random() * 500);
    chosen.add(idx.toString());
  }
  const labels = randomLabels();
  return Array.from(chosen).map((value, idx) => {
    return { value, revealed: false, label: labels[idx] };
  });
}
