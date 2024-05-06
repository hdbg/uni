import * as React from "react";
import {
  Navigate,
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import { GlobalContext } from "../global";
import { TableSkeleton } from "./components/table_skeleton";
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
  Tooltip,
  Zoom,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Edit from "@mui/icons-material/Edit";

const actions = [
  { name: "Create License", icon: <AddCardIcon /> },
  { name: "Create User", icon: <PersonAddIcon /> },
];

function LicenseList({ licenses, app_name }) {
  const delay = 100;
  const step = 200;
  return (
    <TableContainer component={Paper} sx={{ width: "80vw" }}>
      <Table aria-label="licenses">
        <TableHead>
          <TableRow>
            <TableCell align="right">
              <b>Holder</b>
            </TableCell>
            <TableCell align="right">
              <b>HWID</b>
            </TableCell>
            <TableCell align="right">
              <b>Valid Until</b>
            </TableCell>
            <TableCell align="right">
              <b>Status</b>
            </TableCell>
            <TableCell align="right">
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {licenses.map((license) => (
            <Grow in={true} timeout={delay + step * licenses.indexOf(license)}>
              <TableRow key={license.name}>
                <TableCell align="right">{license.holder}</TableCell>
                <TableCell align="right">{license.machine_hwid}</TableCell>
                <TableCell align="right">{license.valid_until}</TableCell>
                <TableCell align="right">{license.status}</TableCell>
                <TableCell align="right">
                  <Fab
                    color="secondary"
                    component={RouterLink}
                    to={`/license/${app_name}/${license.holder}`}
                  >
                    <EditIcon />
                  </Fab>
                </TableCell>
              </TableRow>
            </Grow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function AppDashboard() {
  const params = useParams();
  const name = params.name;

  const context = React.useContext(GlobalContext);

  const [licenses, setLicenses] = React.useState(undefined);
  const [error, setError] = React.useState(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!context.user) return;
    fetch(`/api/license/list/${name}`, {
      method: "GET",
      headers: {
        Authorization: `${context.user.token}`,
      },
    })
      .catch((error) => setError(error.toString()))
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLicenses(data.data);
      });
  }, []);

  if (!context.user) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Licenses</h1>
      {error !== null ? <Alert severity="error">{error}</Alert> : null}
      {licenses === undefined ? <TableSkeleton /> : null}
      {licenses !== undefined && licenses.length === 0 ? (
        <Alert severity="info">No licenses found</Alert>
      ) : null}
      {licenses !== undefined && licenses.length > 0 ? (
        <LicenseList licenses={licenses} app_name={name} />
      ) : null}

      <Box sx={{ position: "fixed", bottom: 16, right: 16, padding: "6vw" }}>
        <Zoom in={true} appear={true} mountOnEnter unmountOnExit>
          <Tooltip title="Create License">
            <Fab
              color="secondary"
              aria-label="add"
              in={true}
              onClick={() => {
                navigate(`/license/create/${name}`, { replace: true });
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Zoom>
      </Box>
    </div>
  );
}
