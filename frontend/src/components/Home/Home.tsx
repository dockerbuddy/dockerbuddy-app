import React from "react";
import { Box, Container, Typography } from "@material-ui/core";

const Home: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h3">Alamakota</Typography>
      </Box>
    </Container>
  );
};

export default Home;
