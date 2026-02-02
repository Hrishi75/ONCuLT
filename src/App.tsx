import { Routes, Route } from "react-router-dom"
import FloatingNavbar from "./components/FloatingNavbar"

import Home from "./app/routes/Home"
import Events from "./app/routes/Events"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <>
      <FloatingNavbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
