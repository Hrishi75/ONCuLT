import { Routes, Route } from "react-router-dom"
import FloatingNavbar from "./components/FloatingNavbar"

import Home from "./app/routes/Home"
import Events from "./app/routes/Events"
import ProtectedRoute from "./components/ProtectedRoute"
import Marketplace from "./app/routes/Marketplace"
import Payout from "./app/routes/Payout"
import PurchaseSuccess from "./app/routes/PurchaseSuccess"
import Community from "./app/routes/Community"




export default function App() {
  return (
    <>
      <FloatingNavbar />
      
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/events"
          element={ <Events />}/>
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/community" element={<Community />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route
  path="/payout"
  element={
    <ProtectedRoute>
      <Payout />
    </ProtectedRoute>
  }
/>

      </Routes>
    </>
  )
}
