import { useParams } from "react-router-dom";
import React from "react";
import { GlobalContext } from "../global";

import {
  Paper,
  Typography,
  LinearProgress,
  Button,
  Grid,
  Backdrop,
  Dialog,
  DialogContent,
  DialogActions,
  Slide,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

function LicenseInfo({ holder, hwid, valid_until, status }) {
  const params = useParams();
  const context = React.useContext(GlobalContext);

  const valid_until_date = dayjs(valid_until).format("DD/MM/YYYY HH:mm");
  const expires_in_human = dayjs(valid_until).fromNow(true);

  const expires_in_days =
    100 - Math.min(Math.max(dayjs(valid_until).diff(dayjs(), "days"), 0), 100);

  return (
    <>
      <Typography variant="h6">
        Holder: <b>{holder}</b>
      </Typography>
      <Typography variant="h6">
        HWID: <b>{hwid}</b>
      </Typography>
      <Typography variant="h6">
        Valid Until: <b>{valid_until_date}</b>
      </Typography>
      <Typography variant="h6">
        Status: <b>{status}</b>
      </Typography>
      <Typography variant="h6">
        Expires In: <b>{expires_in_human}</b>
      </Typography>

      <LinearProgress variant="determinate" value={expires_in_days} />
    </>
  );
}

function LicenseControl({ on_revoke, on_extend }) {
  return (
    <>
      <Button onClick={on_revoke}>Revoke</Button>
      <Button onClick={on_extend}>Extend</Button>
    </>
  );
}
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
function ConfirmRevokeDialog({ state, set_state, callback }) {
  return (
    <Dialog
      open={state.type === "confirm_dialog"}
      TransitionComponent={Transition}
      aria-describedby="alert-dialog"
      disableEnforceFocus
      onClose={() => {
        set_state({ type: "none" });
      }}
    >
      <DialogTitle>{"Confirm"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want revoke?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            set_state({ type: "none" });
          }}
        >
          No
        </Button>
        <Button
          onClick={() => {
            set_state({ type: "confirm" });
            callback();
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LicenseDashboard() {
  const params = useParams();
  const app_name = params.app_name;
  const holder = params.holder;

  const context = React.useContext(GlobalContext);

  const [license_info, set_license_info] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/license/info/${app_name}/${holder}`, {
        headers: {
          Authorization: `${context.user.token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await resp.json();
      if (resp.status === 200) {
        set_license_info(json.data);
      }
    })();
  }, [license_info]);

  const [revoke_state, set_revoke_state] = React.useState({ type: "none" });

  const [loading, set_loading] = React.useState(false);

  const on_revoke = async () => {
    if (revoke_state.type === "none") {
      set_revoke_state({ type: "confirm_dialog" });
      return;
    }

    if (revoke_state.type === "confirm") {
      set_revoke_state({ type: "none" });
      set_loading(true);
    }

    const resp = await fetch(`/api/license/revoke/`, {
      method: "POST",
      headers: {
        Authorization: `${context.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        application: app_name,
        holder: holder,
      }),
    });

    set_loading(false);

    if (resp.status === 200) {
      set_license_info(null);
    }
  };

  return (
    <div>
      <h1>License Dashboard</h1>
      <ConfirmRevokeDialog state={revoke_state} set_state={set_revoke_state} callback={on_revoke} />
      {loading && (
        <CircularProgress
          color="inherit"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        />
      )}

      <Paper
        sx={{ margin: "6px", padding: "30px", border: "2px" }}
        elevation={3}
      >
        {license_info === null ? (
          <Typography variant="h5">Loading...</Typography>
        ) : (
          <Grid container spacing={12}>
            <Grid item>
              <LicenseInfo
                holder={license_info.holder}
                hwid={license_info.machine_hwid}
                valid_until={license_info.valid_until}
                status={license_info.status}
              />
            </Grid>
            <Grid item justifyContent={"center"} alignContent={"center"}>
              <LicenseControl on_revoke={on_revoke} />
            </Grid>
          </Grid>
        )}
      </Paper>
    </div>
  );
}
