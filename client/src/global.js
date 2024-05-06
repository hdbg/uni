import * as React from "react";

const loaded_user = localStorage.getItem("user");
const user = loaded_user ? JSON.parse(loaded_user) : null;

export const GlobalContext = React.createContext({
  user: user,
  server_url: process.env.REACT_APP_BACKEND_URL,
});
