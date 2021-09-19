import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useForm } from "react-hook-form";

interface Rule {
  ruleType: string;
  warnLevel: number;
  criticalLevel: number;
}

interface AddHostFormData {
  hostName: string;
  ip: string;
  rules: [Rule];
}

const AddHost: React.FC = () => {
  const { register, errors, handleSubmit } = useForm<AddHostFormData>();

  const handleAdd = async (data: AddHostFormData) => {
    console.log(data);
  };

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" m={2}>
        <Typography variant="h4">Add new host</Typography>
      </Box>
      <Box>
        <form onSubmit={handleSubmit(handleAdd)}>
          <Grid container item direction="column" spacing={4}>
            <Grid item>
              <TextField
                name="ip"
                label="IP Address"
                variant="outlined"
                fullWidth={true}
                size="small"
                inputRef={register({
                  required: "IP Address is required",
                  pattern: {
                    value:
                      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    message: "Invalid IP Address",
                  },
                })}
                error={!!errors.ip}
                helperText={errors.ip?.message}
              />
            </Grid>
            <Grid item>
              <TextField
                name="hostName"
                label="Host Name"
                variant="outlined"
                fullWidth={true}
                size="small"
                inputRef={register({
                  required: "Host Name is required",
                })}
                error={!!errors.hostName}
                helperText={errors.hostName?.message}
              />
            </Grid>
            <Grid item>
              {/* <Box mt={2}>
                <Typography>Alerting rules</Typography>
              </Box> */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Accordion 1</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography>Accordion 2</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default AddHost;
