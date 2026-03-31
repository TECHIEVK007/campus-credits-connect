import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import CircularProgress from "@/components/CircularProgress";
import { LogOut, QrCode, X, AlertTriangle, Heart } from "lucide-react";

const StudentDashboard = () => {
  const { currentStudent, logout, refreshCurrentStudent } = useUser();
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    refreshCurrentStudent();
  }, []);

  if (!currentStudent) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome,</p>
          <h1 className="text-lg font-bold text-foreground">{currentStudent.name}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="flex justify-center">
          <CircularProgress current={currentStudent.credits} max={800} />
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-3">History</h2>
          {currentStudent.history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No records yet. Keep it up! 🎉</p>
          ) : (
            <div className="space-y-2">
              {currentStudent.history.map((h) => (
                <div key={h.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {h.impact > 0 ? (
                      <Heart className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${h.impact > 0 ? "text-success" : "text-destructive"}`}>
                    {h.impact > 0 ? `+${h.impact}` : h.impact}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <Button className="h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => setShowQR(true)}>
          <QrCode className="w-6 h-6" />
        </Button>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 px-6" onClick={() => setShowQR(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-xs space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-foreground">My QR Code</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowQR(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mx-auto w-48 h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
              <QrCode className="w-20 h-20 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{currentStudent.roll_number}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
