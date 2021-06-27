/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box, Container, Button } from "@material-ui/core";
import AddHostDialog from "../AddHostDialog/AddHostDialog";
import { io } from "socket.io-client";
import { Socket } from "net";

const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ws, setWs] = useState();

  useEffect(() => {
    const ws = io("ws://localhost:5000");
    ws.on("notification", (data) => {
      console.log(data);
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

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
      <AddHostDialog isOpen={isOpen} onClose={handleClose} />
    </Container>
  );
};

export default Home;
