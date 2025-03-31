import React, { useState, useMemo } from "react";
import {
  Box,
  List,
  Typography,
  TextField,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTodoStore } from "@/store/todoStore";
import TodoItem from "./TodoItem";
import dayjs from "dayjs";

const TodoList: React.FC = () => {
  const {
    todos,
    tags,
    selectedTag,
    searchQuery,
    addMultipleTodos,
  } = useTodoStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTodoContent("");
    setSelectedTags([]);
  };

  const handleAddTodo = () => {
    if (newTodoContent.trim()) {
      addMultipleTodos(newTodoContent, selectedTags);
      handleCloseDialog();
    }
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTags(typeof value === "string" ? value.split(",") : value);
  };

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Filter by tag
    if (selectedTag) {
      if (selectedTag === "completed") {
        filtered = filtered.filter((todo) => todo.completed);
      } else {
        filtered = filtered.filter((todo) => todo.tags.includes(selectedTag));
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          tags.some(
            (tag) =>
              todo.tags.includes(tag.id) &&
              tag.name.toLowerCase().includes(query)
          )
      );
    }

    // Sort todos: incomplete first, then by scheduled date or last updated
    return filtered.sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Then sort by scheduled date if available
      if (a.scheduledAt && b.scheduledAt) {
        return dayjs(a.scheduledAt).isBefore(dayjs(b.scheduledAt)) ? -1 : 1;
      }

      // If one has scheduled date and other doesn't, prioritize the scheduled one
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;

      // Finally sort by last updated time
      return dayjs(b.lastUpdatedAt).isBefore(dayjs(a.lastUpdatedAt)) ? -1 : 1;
    });
  }, [todos, selectedTag, searchQuery, tags]);

  // Separate completed and incomplete todos
  const incompleteTodos = filteredTodos.filter((todo) => !todo.completed);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // height: "100vh",
        position: "relative",
        overflowY: "auto",
        gap: 2,
        flex: 1,
      }}
    >


      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }}
      >
        {incompleteTodos.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mt: 2, mb: 1 }}
            >
              Active
            </Typography>
            <List disablePadding>
              {incompleteTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </List>
          </>
        )}

        {completedTodos.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mt: 2, mb: 1 }}
            >
              Completed
            </Typography>
            <List disablePadding>
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </List>
          </>
        )}

        {filteredTodos.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "Try a different search term"
                : "Add a new task to get started"}
            </Typography>
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenDialog}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Add />
      </Fab>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task content"
            placeholder="Enter tasks (one per line)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTodoContent}
            onChange={(e) => setNewTodoContent(e.target.value)}
            helperText="You can add multiple tasks by writing each on a new line. Date formats like 2024/12/03 10:00 or 10-13 will be automatically detected."
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="tags-select-label">Tags</InputLabel>
            <Select
              labelId="tags-select-label"
              multiple
              value={selectedTags}
              onChange={handleTagChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    return tag ? (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        sx={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  <Chip
                    label={tag.name}
                    size="small"
                    sx={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderRadius: "4px",
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddTodo} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;
