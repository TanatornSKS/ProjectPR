import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import CreatePR from "./pages/CreatePR";
import HistoryPR from "./pages/HistoryPR";
function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/createPR" element={<CreatePR />} />
          <Route path="/HistoryPR" element={<HistoryPR />} />


         
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
