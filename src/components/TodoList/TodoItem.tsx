import React, { useState, useRef, useEffect } from "react";
import {
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { MoreVert, Edit, Delete, AccessTime, Label } from "@mui/icons-material";
import { useTodoStore } from "@/store/todoStore";
import { Todo } from "@/types";
import dayjs from "dayjs";

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodo, updateTodo, deleteTodo, tags } = useTodoStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDate, setEditedDate] = useState(todo.scheduledAt || "");
  const [editedTags, setEditedTags] = useState<string[]>(todo.tags);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showDateField, setShowDateField] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditedTitle(todo.title);
    setEditedDate(todo.scheduledAt || "");
    setEditedTags(todo.tags);
  }, [todo]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowDateField(!!todo.scheduledAt);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    deleteTodo(todo.id);
    setDeleteConfirmOpen(false);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      const updates: Partial<Todo> = {
        title: editedTitle.trim(),
        tags: editedTags,
      };

      if (showDateField) {
        updates.scheduledAt = editedDate || null;
      } else {
        updates.scheduledAt = null;
      }

      updateTodo(todo.id, updates);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(todo.title);
    setEditedDate(todo.scheduledAt || "");
    setEditedTags(todo.tags);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setEditedTags(typeof value === "string" ? value.split(",") : value);
  };

  const getTagsForTodo = () => {
    return tags.filter((tag) => todo.tags.includes(tag.id));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  const countTodosByTag = (tagId: string) => {
    return useTodoStore
      .getState()
      .todos.filter((todo) => todo.tags.includes(tagId)).length;
  };

  return (
    <ListItem
      secondaryAction={
        <IconButton edge="end" onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
      }
      sx={{
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        flexDirection: "column",
        alignItems: "flex-start",
        paddingRight: "48px", // 为操作按钮留出空间
        backgroundColor: "#fff",
        borderRadius: "8px",
        marginBottom: "10px",
      }}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
        <ListItemIcon sx={{ minWidth: "42px", mt: isEditing ? 1 : 0 }}>
          <Checkbox
            edge="start"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
            sx={{
              "&.Mui-checked": {
                color: "primary.main",
              },
            }}
          />
        </ListItemIcon>

        {isEditing ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              autoFocus
              sx={{ mb: 1 }}
            />

            <Box
              sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="edit-tags-label">标签</InputLabel>
                <Select
                  labelId="edit-tags-label"
                  multiple
                  value={editedTags}
                  onChange={handleTagChange}
                  input={<OutlinedInput label="标签" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return tag ? (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
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
                    <MenuItem
                      key={tag.id}
                      value={tag.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Label sx={{ color: tag.color, mr: 1 }} />
                        <Typography>{tag.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {countTodosByTag(tag.id)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="计划日期"
                type="datetime-local"
                size="small"
                value={
                  editedDate ? dayjs(editedDate).format("YYYY-MM-DDTHH:mm") : ""
                }
                onChange={(e) => setEditedDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button size="small" onClick={handleCancelEdit}>
                取消
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleSaveEdit}
              >
                保存
              </Button>
            </Box>
          </Box>
        ) : (
          <ListItemText
            primary={
              <Typography
                component="span"
                sx={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "text.secondary" : "text.primary",
                  transition: "all 0.3s",
                }}
              >
                {todo.title}
              </Typography>
            }
            secondary={
              <Box sx={{ mt: 0.5, display: "flex", alignItems: "center" }}>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mr: 1 }}
                >
                  {getTagsForTodo().map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      sx={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderRadius: "5px",
                      }}
                    />
                  ))}
                </Box>

                {todo.scheduledAt && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime
                      fontSize="small"
                      sx={{
                        mr: 0.5,
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(todo.scheduledAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          编辑
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>删除待办事项</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个待办事项吗？此操作无法撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
};

export default TodoItem;
