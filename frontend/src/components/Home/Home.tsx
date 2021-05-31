import React, { useState } from "react";
import { Box, Container, Button } from "@material-ui/core";
import AddHostDialog from "../AddHostDialog/AddHostDialog";

const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setIsOpen(true)}
        >
          Add host
        </Button>
      </Box>
      <AddHostDialog isOpen={isOpen} handleClose={() => setIsOpen(false)} />
    </Container>
  );
};

export default Home;
