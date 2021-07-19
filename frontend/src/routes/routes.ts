import React from "react";
import Home from "../components/Home/Home";
import HostsView from "../components/HostsView/HostsView";

interface Route {
  path: string;
  exact: boolean;
  component: React.FC;
}

export const protectedRoutes: Route[] = [
  {
    path: "/protected",
    exact: true,
    component: Home,
  },
];

export const openRoutes: Route[] = [
  {
    path: "/",
    exact: true,
    // component: Home,
    component: HostsView,
  },
  // {
  //   path: "/hosts",
  //   exact: true,
  //   component: HostsView,
  // },
];
