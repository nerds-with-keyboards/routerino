import Routerino from "routerino";

export const routes = [
  {
    path: "/",
    title: "Packed package home",
    element: <h1>Packed package home</h1>,
  },
  {
    path: "/about",
    title: "Packed package about",
    element: <h1>Packed package about</h1>,
  },
];

export default function App() {
  return (
    <Routerino
      routes={routes}
      title="Packed package consumer"
      notFoundTitle="Packed package not found"
      notFoundTemplate={<h1>Packed package not found</h1>}
    />
  );
}
