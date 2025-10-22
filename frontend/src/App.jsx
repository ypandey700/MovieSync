import Navabar from "./components/Navabar";
import Homepage from "./pages/Homepage";
import Moviepage from './pages/Moviepage'
import { Route, Routes } from "react-router";

function App()
{
  return(
    <div>
      <Navabar/>
      <Routes>
        <Route path={"/"} element={<Homepage />} />
        <Route path={"/movie/:id"} element={<Moviepage/>} />
        
      </Routes>
      
    </div>
  )
}
export default App;