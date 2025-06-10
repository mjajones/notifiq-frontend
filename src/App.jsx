import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CustomerTicketForm from "./pages/CustomerTicketForm";
import TicketForm from './pages/TicketForm'
import IncidentDashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/dashboard" element={<IncidentDashboard/>} />
        <Route path="/tickets" element={<TicketForm />} />
        <Route path="/submit" element={<CustomerTicketForm />} />
      </Route>
    </Routes>
  );
}

export default App;