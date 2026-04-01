import { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QrScanner from "@/components/QrScanner";
import { LogOut, ScanLine, CheckCircle, AlertTriangle, Shirt, FlaskConical, Heart, Award, Loader2, Camera } from "lucide-react";

type Screen = "home" | "qr" | "result" | "success";

const EmployeePortal = () => {
  const { logout, scannedStudent, scanStudent, resetScannedStudent, updateCredits, addCredits } = useUser();
  const [screen, setScreen] = useState<Screen>("home");
  const [fineAlert, setFineAlert] = useState(false);
  const [isReward, setIsReward] = useState(false);
  const [maxCredits, setMaxCredits] = useState(false);
  const [rollInput, setRollInput] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (rollNumber?: string) => {
    const roll = rollNumber || rollInput.trim();
    if (!roll) {
      setScanError("Enter a roll number");
      return;
    }
    setLoading(true);
    setScanError(null);
    const err = await scanStudent(roll);
    setLoading(false);
    if (err) {
      setScanError(err);
      setScreen("home");
    } else {
      setRollInput(roll);
      setScreen("result");
    }
  };

  const handleQrResult = useCallback((result: string) => {
    handleScan(result);
  }, []);

  const handleViolation = async (points: number, reason: string) => {
    if (!scannedStudent) return;
    setLoading(true);
    setIsReward(false);
    const isFine = await updateCredits(scannedStudent.id, points, reason);
    setFineAlert(isFine);
    setLoading(false);
    setScreen("success");
    setTimeout(() => {
      setScreen("home");
      setFineAlert(false);
      setMaxCredits(false);
      setRollInput("");
      resetScannedStudent();
    }, 2500);
  };

  const handleReward = async () => {
    if (!scannedStudent) return;
    setLoading(true);
    setIsReward(true);
    const isMax = await addCredits(scannedStudent.id, 10, "Volunteer/Contribution");
    setMaxCredits(isMax);
    setLoading(false);
    setScreen("success");
    setTimeout(() => {
      setScreen("home");
      setMaxCredits(false);
      setIsReward(false);
      setRollInput("");
      resetScannedStudent();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Employee Portal</p>
          <h1 className="text-lg font-bold text-foreground">Discipline Officer</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {screen === "home" && (
          <div className="text-center space-y-6 w-full max-w-sm">
            <div className="mx-auto w-24 h-24 rounded-full bg-accent flex items-center justify-center">
              <ScanLine className="w-12 h-12 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Scan Student</h2>
            <div className="space-y-3">
              <Input
                placeholder="Enter student roll number"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
              {scanError && <p className="text-sm text-destructive">{scanError}</p>}
              <Button className="w-full h-14 text-base" onClick={handleScan} disabled={loading}>
                {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <ScanLine className="mr-2 w-5 h-5" />}
                Look Up Student
              </Button>
            </div>
          </div>
        )}

        {screen === "result" && scannedStudent && (
          <div className="w-full max-w-sm space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {scannedStudent.name.charAt(0)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{scannedStudent.name}</h2>
              <p className="text-sm text-muted-foreground">{scannedStudent.department} • {scannedStudent.roll_number}</p>
              <div className="bg-accent rounded-lg py-2 px-4 inline-block">
                <span className="text-sm font-semibold text-accent-foreground">
                  Credits: {scannedStudent.credits} / 800
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="destructive"
                className="w-full h-14 text-base"
                onClick={() => handleViolation(10, "Uniform Violation")}
                disabled={loading}
              >
                <Shirt className="mr-2 w-5 h-5" />
                Uniform Violation (-10 pts)
              </Button>
              <Button
                variant="warning"
                className="w-full h-14 text-base"
                onClick={() => handleViolation(20, "Skipping Lab")}
                disabled={loading}
              >
                <FlaskConical className="mr-2 w-5 h-5" />
                Skipping Lab (-20 pts)
              </Button>
              <Button
                variant="success"
                className="w-full h-14 text-base"
                onClick={handleReward}
                disabled={loading}
              >
                <Heart className="mr-2 w-5 h-5" />
                Volunteer/Contribution (+10 pts)
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => { setScreen("home"); resetScannedStudent(); }}>
              Cancel
            </Button>
          </div>
        )}

        {screen === "success" && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-in zoom-in duration-300 bg-success/10">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Thank You – Recorded</h2>
            <p className="text-sm text-muted-foreground">Redirecting to scanner...</p>

            {maxCredits && (
              <div className="bg-primary/10 border border-primary rounded-xl p-4 flex items-center gap-3">
                <Award className="w-6 h-6 text-primary shrink-0" />
                <p className="text-sm font-semibold text-foreground">Max Credits Reached (800/800)!</p>
              </div>
            )}

            {fineAlert && (
              <div className="bg-warning/10 border border-warning rounded-xl p-4 flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">3rd Strike!</p>
                  <p className="text-xs text-muted-foreground">Rs. 50 Fine Issued for Student Welfare Fund.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
