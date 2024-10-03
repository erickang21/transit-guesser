import React from 'react';
import './App.css';
import MainGamePage from "./pages/MainGamePage";
import { MainGameProvider } from "./contexts/MainGameContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="App">
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/game" element={(
                    <MainGameProvider>
                        <MainGamePage />
                    </MainGameProvider>
                )} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
