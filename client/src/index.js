import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import { Navigation } from "./parts/root";

import About from "./pages/about";
import Apps from "./pages/apps";
import Login from "./pages/login";
import Register from "./pages/register";
import CreateApp from "./pages/create-app";
import CreateUserAccount from "./pages/create-user-account";
import AppDashboard from "./pages/app-dashboard";
import CreateLicense from "./pages/create-license";
import LicenseDashboard from "./pages/license-dashboard";

import { GlobalContext } from "./global";

import Grid from "@mui/material/Grid";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import dayjs from "dayjs";

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const paths = [
  {
    path: "/login",
    title: "Login",
  },
  {
    path: "/register",
    title: "Register",
  },
  {
    path: "/apps",
    title: "Apps",
  },
  

  {
    path: "/users/create",
    title: "Create User Account",
  },
  {
    path: "/apps/create",
    title: "Create App",
  },

  {
    path: "/about",
    title: "About",
  },
  
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navigation paths={paths} />
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Grid container justifyContent="center">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/apps/create" element={<CreateApp />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/users/create" element={<CreateUserAccount />} />
            <Route path="/apps/:name" element={<AppDashboard />} />
            <Route path="/license/create/:name" element={<CreateLicense />} />
            <Route path="/license/:app_name/:holder" element={<LicenseDashboard />} />
          </Routes>
        </Grid>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
