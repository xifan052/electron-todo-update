import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Home,
  CheckCircle,
  Add,
  Label,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert,
} from "@mui/icons-material";
import { useTodoStore } from "@/store/todoStore";

// 预定义颜色选项
const colorOptions = [
  "#f44336", // 红色
  "#e91e63", // 粉色
  "#9c27b0", // 紫色
  "#673ab7", // 深紫色
  "#3f51b5", // 靛蓝色
  "#2196f3", // 蓝色
  "#03a9f4", // 浅蓝色
  "#00bcd4", // 青色
  "#009688", // 蓝绿色
  "#4caf50", // 绿色
  "#8bc34a", // 浅绿色
  "#cddc39", // 酸橙色
  "#ffeb3b", // 黄色
  "#ffc107", // 琥珀色
  "#ff9800", // 橙色
  "#ff5722", // 深橙色
  "#795548", // 棕色
  "#607d8b", // 蓝灰色
];

const ColorButton = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Paper
    elevation={selected ? 3 : 1}
    sx={{
      width: 30,
      height: 30,
      bgcolor: color,
      cursor: "pointer",
      border: selected ? "2px solid #000" : "2px solid transparent",
      transition: "all 0.2s",
      "&:hover": {
        transform: "scale(1.1)",
      },
    }}
    onClick={onClick}
  />
);

const Sidebar: React.FC = () => {
  const {
    tags,
    todos,
    selectedTag,
    setSelectedTag,
    addTag,
    updateTag,
    deleteTag,
  } = useTodoStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#f44336");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [tagToEdit, setTagToEdit] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTagId, setMenuTagId] = useState<string | null>(null);

  const handleTagSelect = (tagId: string | null) => {
    setSelectedTag(tagId);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      if (isEditMode && tagToEdit) {
        updateTag(tagToEdit, { name: newTagName.trim(), color: selectedColor });
      } else {
        addTag(newTagName.trim(), selectedColor);
      }
      setNewTagName("");
      setSelectedColor("#f44336");
      setIsEditMode(false);
      setTagToEdit(null);
      setOpenDialog(false);
    }
  };

  const handleEditTag = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    if (tag) {
      setTagToEdit(tagId);
      setNewTagName(tag.name);
      setSelectedColor(tag.color);
      setIsEditMode(true);
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteTag = (tagId: string) => {
    setTagToDelete(tagId);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete);
      if (selectedTag === tagToDelete) {
        setSelectedTag(null);
      }
    }
    setDeleteConfirmOpen(false);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    tagId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuTagId(tagId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTagId(null);
  };

  const countTodosByTag = (tagId: string) => {
    return todos.filter((todo) => todo.tags.includes(tagId)).length;
  };

  const countCompletedTodos = () => {
    return todos.filter((todo) => todo.completed).length;
  };

  const countAllTodos = () => {
    return todos.length;
  };

  return (
    <Paper
      sx={{
        p: 2,
        maxWidth: 280,
        bgcolor: "background.paper",
        overflow: "auto",
      }}
      className="w-64"
    >
      <Typography variant="h5" className="text-center">
        Todo App
      </Typography>

      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedTag === null}
            onClick={() => handleTagSelect(null)}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="所有任务" />
            <Typography variant="body2" color="text.secondary">
              {countAllTodos()}
            </Typography>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedTag === "completed"}
            onClick={() => handleTagSelect("completed")}
          >
            <ListItemIcon>
              <CheckCircle />
            </ListItemIcon>
            <ListItemText primary="已完成" />
            <Typography variant="body2" color="text.secondary">
              {countCompletedTodos()}
            </Typography>
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          标签
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            setIsEditMode(false);
            setNewTagName("");
            setSelectedColor("#f44336");
            setTagToEdit(null);
            setOpenDialog(true);
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>

      <List>
        {tags.map((tag) => (
          <ListItem
            key={tag.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => handleMenuOpen(e, tag.id)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            }
          >
            <ListItemButton
              selected={selectedTag === tag.id}
              onClick={() => handleTagSelect(tag.id)}
            >
              <ListItemIcon>
                <Label sx={{ color: tag.color }} />
              </ListItemIcon>
              <ListItemText primary={tag.name} />
              <Typography variant="body2" color="text.secondary">
                {countTodosByTag(tag.id)}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* 标签菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuTagId && handleEditTag(menuTagId)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          编辑
        </MenuItem>
        <MenuItem onClick={() => menuTagId && handleDeleteTag(menuTagId)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>

      {/* 添加/编辑标签对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isEditMode ? "编辑标签" : "添加新标签"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标签名称"
            type="text"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Label sx={{ color: selectedColor }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              选择颜色
            </Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {colorOptions.map((color) => (
                <Grid item key={color}>
                  <ColorButton
                    color={color}
                    selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleAddTag} variant="contained" color="primary">
            {isEditMode ? "保存" : "添加"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>删除标签</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个标签吗？此操作无法撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDeleteTag} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Sidebar;
