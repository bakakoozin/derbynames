import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Layout } from "./components/Layout";
import { Poke } from "./components/poketest";

export function App() {
  return <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="" element={<Home />} />
      <Route path="test">
        <Route path="" element={<p>test</p>} />
        <Route path=":name" element={<Poke />} />
      </Route>
    </Route>
  </Routes>
}