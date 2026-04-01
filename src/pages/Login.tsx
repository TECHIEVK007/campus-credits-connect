import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

const Login = () => {
  const { login } = useUser();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (asStudent: boolean) => {
    setError(null);
    if (!idNumber || !password) {
      setError("Please enter both ID and password");
      return;
    }
    setLoading(true);
    const err = await login(idNumber, password, asStudent);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Campus Governance</h1>
          <p className="text-sm text-muted-foreground">Credit & Discipline Management System</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            placeholder="Roll Number / Staff ID"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        {/* Dual Login Buttons */}
        <div className="space-y-3">
          <Button className="w-full h-12 text-base" onClick={() => handleLogin(true)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <GraduationCap className="mr-2 w-5 h-5" />}
            Login as Student
          </Button>
          <Button variant="outline" className="w-full h-12 text-base border-primary text-primary hover:bg-accent" onClick={() => handleLogin(false)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <ShieldCheck className="mr-2 w-5 h-5" />}
            Login as Staff
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>Students: Use your Roll Number + password <strong>ROLL</strong></p>
          <p>Staff: ID <strong>STAFF001</strong> / Password <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
