import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerTicketForm from "./pages/CustomerTicketForm";
import IncidentDashboard from "./pages/Dashboard";
import Header from "./components/Header"; //
import NotFound from "./pages/NotFound"; // 

function App() {
  return (
    <Router>
      <div className="max-w-6xl mx-auto px-4">
        <Header /> 
        <Routes>
          <Route path="/" element={<CustomerTicketForm />} />
          <Route path="/dashboard" element={<IncidentDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;