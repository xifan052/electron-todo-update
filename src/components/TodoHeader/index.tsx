import { Box, Typography, InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import dayjs from "dayjs";
import { useTodoStore } from "@/store/todoStore";
import { getGreeting } from "@/utils";

const greeting = getGreeting();
const formatDate = dayjs().format("ddd D MMM YYYY");

const TodoHeader = () => {
  const { searchQuery, setSearchQuery } = useTodoStore();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 2
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h5" >
          {greeting}👋
        </Typography>
        <Typography sx={{ mb: 2, color: "gray" }}>
          Today,{formatDate}
        </Typography>
      </Box>
      <Box>
        <TextField
          fullWidth
          placeholder="Search tasks..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default TodoHeader;
