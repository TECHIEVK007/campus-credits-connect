import { useUser } from "@/contexts/UserContext";
import Login from "./Login";
import StudentDashboard from "./StudentDashboard";
import EmployeePortal from "./EmployeePortal";

const Index = () => {
  const { isLoggedIn, isStudent } = useUser();

  if (!isLoggedIn) return <Login />;
  return isStudent ? <StudentDashboard /> : <EmployeePortal />;
};

export default Index;
