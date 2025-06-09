import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerTicketForm from "./pages/CustomerTicketForm";
import Sidebar from './components/Sidebar'
import IncidentDashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound"; // 

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow bg-[#1e1e2f] min-h-screen">
        <Routes>
          <Route path="/dashboard" element={<IncidentDashboard />} />
          <Route path="/tickets" element={<TicketForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;