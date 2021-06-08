/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";

const HostsDisplay: React.FC = () => {
  const [hosts, setHosts] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${proxy}/hosts`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          setIsLoading(false);
          setError(true);
          throw new Error(`Response code is ${response.status}`);
        }
      })
      .then((json) => {
        setHosts(hosts);
        setIsLoading(false);
      })
      .catch((e) => console.log(e));
  }, []);

  console.log(hosts);

  return <></>;
};

export default HostsDisplay;
