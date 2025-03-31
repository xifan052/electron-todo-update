export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  scheduledAt: string | null;
  lastUpdatedAt: string;
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}