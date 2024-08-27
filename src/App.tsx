import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Home } from "./pages/home"
import { Derbynames } from "./pages/derbynames"
import { Clubs } from "./pages/clubs"
import { NotFound } from "./pages/not-found"
import { ValidateEmail } from "./pages/validate-email"

export function App() {
  return <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="" element={<Derbynames />} />
      <Route path="/derbyname/:slug" element={<Home />} />
      <Route path="/derbynames" element={<Derbynames />} />
      <Route path="/clubs" element={<Clubs />} />
      <Route path="/validate/:token" element={<ValidateEmail />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  </Routes>

}