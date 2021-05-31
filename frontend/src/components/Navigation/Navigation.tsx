import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { openRoutes, protectedRoutes } from "../../routes/routes";

const Navigation: React.FC = () => {
  const authorized = false;

  return (
    <>
      {!authorized ? (
        <Switch>
          {openRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
          <Redirect to="/" />
        </Switch>
      ) : (
        <Switch>
          {openRoutes.concat(protectedRoutes).map((route) => (
            <Route key={route.path} {...route} />
          ))}
          <Redirect to="/" />
        </Switch>
      )}
    </>
  );
};

export default Navigation;
