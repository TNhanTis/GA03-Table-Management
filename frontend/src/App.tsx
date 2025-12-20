import { BrowserRouter, Routes, Route } from "react-router-dom";
import TableManagement from "./pages/TableManagement";
import Menu from "./pages/Menu";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableManagement />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
