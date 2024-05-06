import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Fade";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Grid from "@mui/material/Grid";
import Divider from '@mui/material/Divider';
import Paper from "@mui/material/Paper";

function Technology({ title, description, image, link }) {
  return (
    <Paper elevation={5}>
      <Card sx={{ maxWidth: 345}}>
        <CardActionArea>
          <CardMedia component="img" height="100vh" image={image} alt={title} sx ={{objectFit: "contain"}} />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" height="7vh">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" href={link}>
            Details
          </Button>
        </CardActions>
      </Card>
    </Paper>
  );
}

const technologies = [
  {
    title: "React",
    description: "A JavaScript library for building user interfaces",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1280px-React-icon.svg.png",
    link: "https://reactjs.org/",
  },
  {
    title: "Material-UI",
    description: "React components for faster and easier web development",
    image: "https://th.bing.com/th/id/OIP.rpiHSO8j5Ng9dzobkcvAkQAAAA?rs=1&pid=ImgDetMain",
    link: "https://material-ui.com/",
  },
  {
    title: "Express",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    image: "https://expressjs.com/images/express-facebook-share.png",
    link: "https://expressjs.com/",
  },
  {
    title: "Node.js",
    description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    image: "https://logodix.com/logo/1764972.png",
    link: "https://nodejs.org/",
  },
  // mongodb
  {
    title: "MongoDB",
    description: "The most popular database for modern apps",
    image:
      "https://webassets.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png",
    link: "https://www.mongodb.com/",
  },
];

function Description() {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        About
      </Typography>
      <Typography variant="body1" gutterBottom>
        Small application for purpose of me learning React.
        Originally, this was a simple CRUD application for managing licenses. <br />
        However, I decided to expand it to include user management and application management.
        The backend is written in Node.js and Express, with MongoDB as the database.

        <br />
        <br />


        In the future, I plan to add more features and improve the UI/UX and also native SDK.
      </Typography>
    </Box>
  );
}

function Technologies() {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Technologies
      </Typography>
      <Grid container spacing={3}>
        {technologies.map((technology) => (
          <Grid item key={technology.title} xs={4} sm={2}>
            <Technology {...technology} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default function About() {
  return (
      <Slide
        direction="right"
        in={true}
        appear={true}
        mountOnEnter
        unmountOnExit
      >
        <div>
          <Description />
          <br />
          <br />
          <Technologies />
        </div>
      </Slide>
  );
}
