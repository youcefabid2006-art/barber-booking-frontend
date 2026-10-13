import { BrowserRouter, Route, Routes } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import AdminDash from "./pages/AdminDash";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/shop/:slug" element={<ShopPage />} />
        <Route path="/admin" element={<AdminDash shopId={1} />} />
      </Routes>
    </BrowserRouter>
  );
}
