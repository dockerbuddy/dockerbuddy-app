import React from "react";
import Home from "../components/Home/Home";

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
    component: Home,
  },
];
