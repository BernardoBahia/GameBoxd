import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute, ToastContainer } from "./components";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Profile from "./pages/Profile";
import MyLists from "./pages/MyLists";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ToastContainer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-lists"
                element={
                  <ProtectedRoute>
                    <MyLists />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
