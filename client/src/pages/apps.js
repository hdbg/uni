import * as React from "react";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";
import { TableSkeleton } from "./components/table_skeleton";

import { GlobalContext } from "../global";
import {
  Alert,
  CircularProgress,
  Button,
  SpeedDial,
  SpeedDialIcon,
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
  Skeleton,
  Stack,
} from "@mui/material";

function AppList({ apps }) {
  const delay = 100;
  const step = 200;
  return (
    <TableContainer component={Paper} sx={{ width: "80vw" }}>
      <Table aria-label="apps" sx={{ width: "auto" }}>
        <TableHead>
          <TableRow>
            <TableCell align="left">App ID</TableCell>
            <TableCell align="left">App Public Key</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody sx={{ width: "75vw" }}>
          {apps.map((app) => (
            <Grow in={true} timeout={delay + step * apps.indexOf(app)}>
              <TableRow key={app.name}>
                <TableCell sx={{ width: "5vw" }} component="th">
                  {app.name}
                </TableCell>
                <TableCell sx={{ width: "70vw" }}>
                  <Typography variant="body1">{app.public_key}</Typography>
                </TableCell>
                <TableCell
                  sx={{
                    width: "5vw",
                    alignItems: "center",
                    justifyItems: "right",
                  }}
                >
                  <Button component={RouterLink} to={`/apps/${app.name}`}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            </Grow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function Apps() {
  const context = React.useContext(GlobalContext);

  const [apps, setApps] = React.useState(undefined);
  const [error, setError] = React.useState(null);

  const navigate = useNavigate();

  console.log("mount");

  React.useEffect(() => {
    if (!context.user) return;
    fetch("/api/application/list", {
      method: "GET",
      headers: {
        Authorization: `${context.user.token}`,
      },
    })
      .catch((error) => setError(error.toString()))
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setApps(data.data);
      });
  }, []);

  if (!context.user) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Apps</h1>
      {error !== null ? <Alert severity="error">{error}</Alert> : null}
      {apps === undefined ? <TableSkeleton /> : null}
      {apps !== undefined && apps.length === 0 ? (
        <Alert severity="info">No apps found</Alert>
      ) : null}
      {apps !== undefined && apps.length > 0 ? <AppList apps={apps} /> : null}

      <Box sx={{ position: "fixed", bottom: 16, right: 16, padding: "6vw" }}>
        <SpeedDial
          ariaLabel="create-app"
          icon={<SpeedDialIcon />}
          onClick={() => {
            navigate("/apps/create", { replace: true });
          }}
        ></SpeedDial>
      </Box>
    </div>
  );
}
