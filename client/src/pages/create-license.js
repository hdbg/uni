import * as React from "react";
import {
  Navigate,
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import { GlobalContext } from "../global";
import {
  Alert,
  CircularProgress,
  Button,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grow,
  Fab,
  Fade,
  TextField,
  Tooltip,
  Zoom,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";

export default function CreateLicense() {
  const params = useParams();
  const name = params.name;

  const navigate = useNavigate();

  const context = React.useContext(GlobalContext);

  const [success, setSuccess] = React.useState(false);

  const [error, setError] = React.useState(null);
  const [username_validity, set_username_validity] = React.useState({
    type: null,
  });

  const [data, setData] = React.useState({});

  const error_transition_delay = 500;

  const verify_username = async (username) => {
    if (!username) return;
    if (username == "") {
      set_username_validity({ type: null });
      return;
    }

    set_username_validity({ type: "loading" });
    const resp = await fetch(`/api/user/exists/${username}`, {
      headers: {
        Authorization: `${context.user.token}`,
        "Context-Type": "application/json",
      },
    });

    console.log(resp);

    const json = await resp.json();

    if (resp.status === 200 && json.data.exists) {
      set_username_validity({ type: "valid" });
    } else {
      set_username_validity({ type: "invalid" });
    }
  };

  const submit = async () => {
    const remove_error = () => {
      setTimeout(() => setError(null), error_transition_delay + 2000);
    };

    if (username_validity.type !== "valid") {
      setError("Invalid username");
      remove_error();
      return;
    }

    if (!data.holder) {
      setError("Holder is required");
      remove_error();
      return;
    }

    if (!data.hwid) {
      setError("HWID is required");
      remove_error();
      return;
    }

    if (!data.valid_until) {
      setError("Date is required");
      remove_error();
      return;
    }

    console.log(data);

    const body = {
      holder: data.holder,
      hwid: data.hwid,
      valid_until: data.valid_until.unix() * 1000,
      application: name,
    };

    const resp = await fetch(`/api/license/grant/`, {
      method: "POST",
      headers: {
        Authorization: `${context.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(body)

    const json = await resp.json();

    if (resp.status === 200) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(`/apps/${name}`);
      }, 3000);
    } else {
      console.log([resp, json]);
      setError(json?.errors?.msg ?? "Unknown error");
      remove_error();
    }
  };

  return (
    <div>
      <h1>Create License for {name}</h1>
      {error !== null ? (
        <Fade in={error !== null} timeout={{ enter: error_transition_delay }}>
          <Alert severity="error">{error}</Alert>
        </Fade>
      ) : null}
      {success == true ? (
        <Fade in={success} timeout={{ enter: error_transition_delay }}>
          <Alert severity="success">License created! Redirecting...</Alert>
        </Fade>
      ) : null}
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <TextField
          id="holder"
          label="Holder"
          variant="outlined"
          sx={{ margin: 2 }}
          onChange={(e) => {
            setData({ ...data, holder: e.target.value });
            verify_username(e.target.value);
          }}
        />
        {username_validity.type === "loading" && <CircularProgress />}
        {username_validity.type === "valid" && (
          <Alert severity="success" sx={{ height: "5vh" }}>
            Valid
          </Alert>
        )}
        {username_validity.type === "invalid" && (
          <Alert severity="error" sx={{ height: "5vh" }}>
            Invalid
          </Alert>
        )}
      </Box>
      <br />
      <TextField
        id="hwid"
        label="HWID"
        variant="outlined"
        sx={{ margin: 2 }}
        onChange={(e) => {
          setData({ ...data, hwid: e.target.value });
        }}
      />
      <Typography variant="h6">Valid Until</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDateTimePicker
          orientation="landscape"
          disablePast={true}
          onChange={(e) => {
            setData({ ...data, valid_until: e });
          }}
        />
      </LocalizationProvider>
      <Button
        variant="outlined"
        sx={{ margin: 2, width: "20vw" }}
        onClick={submit}
      >
        {" "}
        Create{" "}
      </Button>
    </div>
  );
}
