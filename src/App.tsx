import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Layout } from "./components/Layout";
import { Poke } from "./components/poketest";
import { Pokemons } from "./pages/pokemons";
import { TicTacToeGame } from "./pages/tic-tac-toe-game";
import { CounterApp } from "./pages/counter-app";
import { ApiTestRender } from "./pages/api-test";

export function App() {
  return <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="" element={<Home />} />
      <Route path="/pokemons" element={<Pokemons />} />
      <Route path="/tictactoe" element={<TicTacToeGame />} />
      <Route path="/counter" element={<CounterApp />} />
      <Route path="/api-test" element={<ApiTestRender />} />
      <Route path="test">
        <Route path="" element={<p>test</p>} />
        <Route path=":name" element={<Poke />} />
      </Route>
    </Route>
  </Routes>
}