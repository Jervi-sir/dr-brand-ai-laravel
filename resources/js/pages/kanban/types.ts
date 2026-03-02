export interface Column {
  id: string;
  title: string;
}

export const defaultCols: Column[] = [
  // { id: 'script', title: 'Script' },
  { id: 'voice_over', title: 'Voice Over' },
  { id: 'creation', title: 'Creation' },
  { id: 'done', title: 'Done' },
];

export type ColumnId = (typeof defaultCols)[number]['id'];
