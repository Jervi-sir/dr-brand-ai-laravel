export type TEventColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' | 'Serious';

export interface IEvent {
  id: string | number;
  userId?: string;
  title: string;
  userPrompt?: string;
  endDate: string;
  color: TEventColor;
  stage?: string;
  generatedScript?: string;
  description?: string;
}

export const colorClasses: Record<string, string> = {
  voice_over: 'bg-gray-950 text-white border border-gray-800',
  creation: 'bg-emerald-950 text-white border border-emerald-900',
  done: 'bg-stone-800 text-white border border-stone-700',
  default: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
};
