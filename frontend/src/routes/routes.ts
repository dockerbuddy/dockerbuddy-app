import React from "react";
import AddHost from "../components/AddHost/AddHost";
import Dashboard from "../components/Dashboard/Dashboard";

interface Route {
  path: string;
  exact: boolean;
  component: React.FC;
}

export const protectedRoutes: Route[] = [
  {
    path: "/protected",
    exact: true,
    component: Dashboard,
  },
];

export const openRoutes: Route[] = [
  {
    path: "/",
    exact: true,
    component: Dashboard,
  },
  {
    path: "/addHost",
    exact: true,
    component: AddHost,
  },
];
