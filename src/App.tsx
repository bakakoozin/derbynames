import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Layout } from "./components/Layout";
import { ApiTestRender } from "./pages/api-test";
import { Liste } from "./pages/liste"

export function App() {
  return <Routes>
    <Route path="/" element={<Layout />} >
      <Route path="" element={<Home />} >
        <Route path="/api-test" element={<ApiTestRender />} />
        <Route path="" element={<Liste />} />
      </Route>
    </Route>
  </Routes>
}