import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { ApiTestRender } from "./pages/api-test"
import { Home } from "./pages/home"
import { ListeDerbynames } from "./pages/liste-derbynames"
import { ListeClubs } from "./pages/liste-clubs"

export function App() {
  return <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="" element={<Home />} />
      <Route path="/api-test" element={<ApiTestRender />} />
      <Route path="/liste-derbynames" element={<ListeDerbynames />} />
      <Route path="/liste-clubs" element={<ListeClubs />} />
    </Route>
  </Routes>
}