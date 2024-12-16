import React from 'react';
import './App.css';
import MainGamePage from "./pages/MainGamePage";
import { MainGameProvider } from "./contexts/MainGameContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {AuthProvider} from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
      <AuthProvider>
            <div className="App">
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/game" element={(
                            <ProtectedRoute>
                                <MainGameProvider>
                                    <MainGamePage />
                                </MainGameProvider>
                            </ProtectedRoute>
                            )}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </Router>
            </div>
      </AuthProvider>
  );
}

export default App;
