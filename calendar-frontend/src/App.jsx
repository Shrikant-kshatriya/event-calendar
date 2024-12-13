import React, { useState, createContext } from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState();
  return (
    <UserContext.Provider value={{user, setUser}}>
      <Router>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  )
};

export default App;
