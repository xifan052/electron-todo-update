import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { theme } from "./theme/theme";
import Sidebar from "./components/Sidebar";
import TodoList from "./components/TodoList";
import TodoHeader from "./components/TodoHeader";

dayjs.locale("zh-cn");

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100vh",
          p: 1.5,
          gap: 1.5,
        }}
      >
        <Sidebar />
        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            px: 10,
          }}
        >
          <TodoHeader />
          <TodoList />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
