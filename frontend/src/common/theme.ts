import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#3ED7C2",
    },
    secondary: {
      main: "#ff4b3a",
    },
    background: {
      default: "rgba(8,1,9,1)",
      paper: "rgba(8,1,9,1)",
    },
    text: {
      primary: "rgba(173,186,199,1)",
      secondary: "rgba(173,186,199,0.7)",
      disabled: "rgba(173,186,199,0.5)",
      hint: "rgba(173,186,199,0.4)",
    },
  },
  typography: {
    fontFamily: ["Lexend Deca", "sans-serif"].join(","),
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          background:
            "linear-gradient(40deg, rgba(26,19,59,1) 0%, rgba(8,1,9,1) 20%, rgba(8,1,9,1) 80%, rgba(62,45,9,1) 100%);",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        },
      },
    },
  },
});

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;
