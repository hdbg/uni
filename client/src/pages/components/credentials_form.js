import {
  TextField,
  Typography,
  Paper,
  Button,
  Slide,
  Alert,
} from "@mui/material";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GlobalContext } from "../../global";

import * as React from "react";

export function Credentials({
  title,
  button_title,
  subtitle,
  subtitle_button_name,
  subtitle_button_link,
  set_login,
  set_password,
  on_submit,
  error,
  successful,
}) {
  const common = {
    sx: {
      width: "15vw",
      margin: 1,
    },
  };

  return (
    <Slide direction="right" in={true} appear={true} mountOnEnter unmountOnExit>
      <div>
        <Paper
          elevation={5}
          variant="outlined"
          sx={{
            padding: 10,
            margin: 2,
            display: "inline-block",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          <div>
            <Typography variant="h3" gutterBottom>
              {title}
            </Typography>
            {successful && (
              <Slide direction="left" in={true} appear={true} mountOnEnter unmountOnExit>
                <Alert severity="success">Success</Alert>
              </Slide>
            )}
            <TextField
              id="username"
              label="Username"
              variant="standard"
              onChange={(e) => {
                console.log(e);
                set_login(e.target.value);
              }}
              {...common}
              {...(error.login && { error: true, helperText: error.login })}
            />
            <br />
            <TextField
              id="password"
              label="Password"
              variant="standard"
              type="password"
              onChange={(e) => set_password(e.target.value)}
              {...common}
              {...(error.password && {
                error: true,
                helperText: error.password,
              })}
            />
            <br />
            <Button variant="outlined" onClick={on_submit} {...common}>
              {button_title}
            </Button>
            <br />
            <Typography variant="subtitle2" {...common}>
              {subtitle}
              <Button
                variant="text"
                size="small"
                {...common}
                component={Link}
                to={subtitle_button_link}
              >
                {subtitle_button_name}
              </Button>
            </Typography>
            {error.global && <Alert severity="error">{error.global}</Alert>}
          </div>
        </Paper>
      </div>
    </Slide>
  );
}

export function Form({
  title,
  button_title,
  subtitle,
  subtitle_button_name,
  subtitle_button_link,
  endpoint,
  additional,

  is_custom = false,
}) {
  const [login, set_login] = React.useState(null);
  const [password, set_password] = React.useState(null);

  const [error, set_error] = React.useState({
    login: null,
    password: null,
    global: null,
    successful: null,
  });

  const [succ, set_succ] = React.useState(false);

  const context = React.useContext(GlobalContext);

  const navigate = useNavigate();

  const on_submit = () => {
    let is_failed = false;
    set_error({ login: null, password: null, global: null });
    if (!login) {
      set_error((error) => ({ ...error, login: "Login is required" }));
      is_failed = true;
    }
    if (!password) {
      set_error((error) => ({ ...error, password: "Password is required" }));
      is_failed = true;
    }

    if (password && password.includes(" ")) {
      set_error((error) => ({
        ...error,
        password: "Password can't contain spaces",
      }));
      is_failed = true;
    }

    if (is_failed) {
      return;
    }

    fetch(`/api/user/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: login, password, ...additional }),
    }).then((response) => {
      console.log(response);
      if (response.status === 200) {
        response.json().then((data) => {
          if (!is_custom) {
            console.log(data);
            context.user = {
              username: login,
              role: "DEV",
              token: data.data.token,
            };
            localStorage.setItem("user", JSON.stringify(context.user));

            navigate("/apps", { replace: true });
          }
          set_succ(true);

          setTimeout(() => {
            set_succ(false);
          }, 3000);
        });
      } else {
        response.json().then((data) => {
          console.log(data);
          set_error((error) => ({
            ...error,
            global: data?.errors?.msg ?? "Unknown error",
          }));
        });
      }
    });
  };

  if (context.user && !is_custom) {
    return <Navigate to="/apps" />;
  }
  return (
    <Credentials
      title={title}
      button_title={button_title}
      subtitle={subtitle}
      subtitle_button_name={subtitle_button_name}
      subtitle_button_link={subtitle_button_link}
      set_login={set_login}
      set_password={set_password}
      on_submit={on_submit}
      error={error}
      successful={succ}
    />
  );
}
