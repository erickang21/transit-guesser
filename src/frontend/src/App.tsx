import React from 'react';
import './App.css';
import MainGamePage from "./pages/MainGamePage";
import { MainGameProvider } from "./contexts/MainGameContext";

function App() {
  return (
    <div className="App">
        <MainGameProvider>
            <MainGamePage />
        </MainGameProvider>
    </div>
  );
}

export default App;
