import { useState, useEffect } from "react";
import Navabar from "./components/Navabar";
import Homepage from "./pages/Homepage";
import Moviepage from './pages/Moviepage'
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp"
import Watchparty from "./pages/Watchparty";
import PartyRoom from "./pages/Partyroom";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds loader
  }, []);

  if (loading) {
    return <Loader />;
  }

  return(
    <div className="bg-[#0B0B14] min-h-screen">
      <Navabar/>
      <Routes>
        <Route path={"/"} element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path={"/movie/:id"} element={
          <ProtectedRoute>
            <Moviepage/>
          </ProtectedRoute>
        } />
        <Route path={"/signin"} element={<SignIn />} />
        <Route path={"/signup"} element={<SignUp />} />
        <Route path={"/watchparty"} element={
          <ProtectedRoute>
            <Watchparty />
          </ProtectedRoute>
        } />
        <Route path="/watchparty/:id" element={
          <ProtectedRoute>
            <PartyRoom />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}
export default App;