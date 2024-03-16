import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./login/login.component";
import RedirectLogout from "./redirect-logout/redirect-logout.component";
import ConfirmLocation from "./confirm-location/confirm.location.component";

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={window.spaBase}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/confirm" element={<Login />} />
        <Route path="/login/location" element={<ConfirmLocation />} />
        <Route path="/logout" element={<RedirectLogout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
