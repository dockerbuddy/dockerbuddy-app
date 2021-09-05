import React, { useEffect } from "react";
import { proxy } from "../common/api";

const HostContext = React.createContext<ContextState | null>(null);

export const useHostsData = (): ContextState => {
  const contextType = React.useContext(HostContext);
  if (contextType === null) {
    throw new Error("useHostData must be used within HostsDataProvider score");
  }
  return contextType;
};

export const HostsDataProvider: React.FC = ({ children }) => {
  // const intervalSeconds = 1;
  const [state, setState] = React.useState<ContextState>({ status: "LOADING" });

  useEffect(() => {
    setState({ status: "LOADING" });

    async function asyncFetch() {
      const response = await fetch(`${proxy}/hosts`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setState({
          status: "LOADED",
          hosts: Object.values(json),
        });
      } else {
        setState({
          //TODO why error never appears?
          status: "ERROR",
        });
        console.error(`Response code is ${response.status}`);
      }
    }
    asyncFetch();

    // const interval = setInterval(() => {
    //   asyncFetch();
    // }, intervalSeconds * 1000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <HostContext.Provider value={state}> {children} </HostContext.Provider>
  );
};
