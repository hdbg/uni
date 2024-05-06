import * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Typography, TextField, Button } from "@mui/material";

import { GlobalContext } from "../global";
import {
  Alert,
  CircularProgress,
  SpeedDial,
  SpeedDialIcon,
  Box,
} from "@mui/material";

export default function CreateApp() {
  const context = React.useContext(GlobalContext);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [app_name, set_app_name] = React.useState(null);

  const common = {
    sx: {
      margin: 2,
    },
  };

  const navigate = useNavigate();

  if (!context.user) return <Navigate to="/login" />;

  const on_submit = async () => {
    setError(null);
    if (!app_name) {
      setError("App name is required");
      return;
    }
    const resp = await fetch("/api/application/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `${context.user.token}`,
      },
      body: JSON.stringify({ name: app_name }),
    });

    const json = await resp.json() ?? {errors: {msg: "Unknown error"}};

    if (resp.status === 200) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/apps", { replace: true });
      }, 3000);
    } else {
      setError(json.errors.msg);
    }
      
  };

  return (
    <Box>
      <Typography variant="h3" {...common}>
        Create App
      </Typography>
        {success ? <Alert severity="success">App created!</Alert> : null}
        {error !== null ? <Alert severity="error">{error}</Alert> : null}
      <TextField label="App name" variant="standard" {...common} onChange={(event) => {
          set_app_name(event.target.value);
        }} />
      <br />
      <Button
        variant="outlined"
        {...common}
        onClick={on_submit}
      >
        Create
      </Button>
    </Box>
  );
}
