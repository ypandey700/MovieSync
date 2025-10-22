import Navabar from "./components/Navabar";
import Homepage from "./pages/Homepage";
import Moviepage from './pages/Moviepage'
import { Route, Routes } from "react-router";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp"
import Watchparty from "./pages/Watchparty";
import PartyRoom from "./pages/Partyroom";

function App()
{
  return(
    <div>
      <Navabar/>
      <Routes>
        <Route path={"/"} element={<Homepage />} />
        <Route path={"/movie/:id"} element={<Moviepage/>} />
        <Route path={"/signin"} element={<SignIn />} />
        <Route path={"/signup"} element={<SignUp />} />
        <Route path={"/watchparty"} element={<Watchparty />} />
        <Route path="/watchparty/:id" element={<PartyRoom />} />
        
      </Routes>
      
    </div>
  )
}
export default App;