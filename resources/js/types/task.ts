export type TaskStage = 'script' | 'voice_over' | 'creation' | 'done';

export interface Task {
  id: string;
  title?: string;
  user_prompt?: string;
  stage: TaskStage | string;
  generated_script: string;
  scheduled_date?: string;
  deadline?: string;
}
