import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CustomerTicketForm from "./pages/CustomerTicketForm";
import TicketForm from './pages/TicketForm'
import IncidentDashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound"; // 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<IncidentDashboard/>} />
        <Route path="tickets/new" element={<TicketForm />} />
        <Route path="/submit" element={<CustomerTicketForm />} />
      </Route>
    </Routes>
  );
}

export default App;