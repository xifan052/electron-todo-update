import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import { Todo, Tag } from '../types';

interface TodoState {
  todos: Todo[];
  tags: Tag[];
  selectedTag: string | null;
  searchQuery: string;
  addTodo: (title: string, tags?: string[], scheduledAt?: string | null) => void;
  addMultipleTodos: (content: string, tags?: string[]) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setSelectedTag: (tagId: string | null) => void;
  setSearchQuery: (query: string) => void;
}

// Helper function to extract date from text
const extractDateFromText = (text: string): { cleanText: string; date: string | null } => {
  // Match patterns like 2024/12/03 10:00 or 2024-12-03 10:00
  const fullDateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s\d{1,2}:\d{2})/g;
  // Match patterns like 10-13 (month-day)
  const shortDateRegex = /(\d{1,2}[-/]\d{1,2})/g;
  
  let cleanText = text;
  let date: string | null = null;
  
  // Check for full date format
  const fullDateMatch = text.match(fullDateRegex);
  if (fullDateMatch) {
    date = dayjs(fullDateMatch[0].replace(/\//g, '-')).format('YYYY-MM-DD HH:mm:00');
    cleanText = text.replace(fullDateRegex, '').trim();
    return { cleanText, date };
  }
  
  // Check for short date format
  const shortDateMatch = text.match(shortDateRegex);
  if (shortDateMatch) {
    const parts = shortDateMatch[0].split(/[-/]/);
    const currentYear = dayjs().year();
    date = dayjs(`${currentYear}-${parts[0]}-${parts[1]} 00:00:00`).format('YYYY-MM-DD HH:mm:00');
    cleanText = text.replace(shortDateRegex, '').trim();
    return { cleanText, date };
  }
  
  return { cleanText, date };
};

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      tags: [
        { id: '1', name: 'Personal', color: '#9c27b0' },
        { id: '2', name: 'Work', color: '#2196f3' },
        { id: '3', name: 'Shopping', color: '#ff9800' }
      ],
      selectedTag: null,
      searchQuery: '',
      
      addTodo: (title, tags = [], scheduledAt = null) => {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const newTodo: Todo = {
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: now,
          scheduledAt,
          lastUpdatedAt: now,
          tags: tags || [],
        };
        
        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));
      },
      
      addMultipleTodos: (content, tags = []) => {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        
        const newTodos = lines.map(line => {
          const { cleanText, date } = extractDateFromText(line);
          
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: cleanText,
            completed: false,
            createdAt: now,
            scheduledAt: date,
            lastUpdatedAt: now,
            tags,
          };
        });
        
        set((state) => ({
          todos: [...newTodos, ...state.todos],
        }));
      },
      
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? { ...todo, completed: !todo.completed, lastUpdatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
              : todo
          ),
        }));
      },
      
      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? { 
                  ...todo, 
                  ...updates, 
                  lastUpdatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') 
                }
              : todo
          ),
        }));
      },
      
      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },
      
      addTag: (name, color) => {
        const newTag: Tag = {
          id: Date.now().toString(),
          name,
          color,
        };
        
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
      },
      
      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id
              ? { ...tag, ...updates }
              : tag
          ),
        }));
      },
      
      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
          todos: state.todos.map(todo => ({
            ...todo,
            tags: todo.tags.filter(tagId => tagId !== id)
          }))
        }));
      },
      
      setSelectedTag: (tagId) => {
        set({ selectedTag: tagId });
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'todo-storage',
    }
  )
);