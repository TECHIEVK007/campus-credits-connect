import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Violation {
  id: string;
  title: string;
  impact: number;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  department: string;
  credits: number;
  violations: Violation[];
  violationCount: number;
}

interface UserContextType {
  isLoggedIn: boolean;
  isStudent: boolean;
  currentStudent: Student;
  login: (isStudent: boolean) => void;
  logout: () => void;
  updateCredits: (studentId: string, points: number, reason: string) => boolean;
  resetScannedStudent: () => void;
  scannedStudent: Student | null;
  scanStudent: () => void;
}

const DEFAULT_STUDENT: Student = {
  id: "STU2026001",
  name: "Arjun Mehta",
  department: "Computer Science",
  credits: 800,
  violations: [],
  violationCount: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [student, setStudent] = useState<Student>({ ...DEFAULT_STUDENT });
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);

  const login = useCallback((asStudent: boolean) => {
    setIsStudent(asStudent);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  // Central updateCredits function — SQL-ready
  const updateCredits = useCallback((studentId: string, points: number, reason: string): boolean => {
    const violation: Violation = {
      id: crypto.randomUUID(),
      title: reason,
      impact: -points,
      date: new Date().toISOString().split("T")[0],
    };

    let isFineTriggered = false;

    setStudent((prev) => {
      const newCount = prev.violationCount + 1;
      isFineTriggered = newCount % 3 === 0;
      const updated = {
        ...prev,
        credits: Math.max(0, prev.credits - points),
        violations: [violation, ...prev.violations],
        violationCount: newCount,
      };
      setScannedStudent(updated);
      return updated;
    });

    return isFineTriggered;
  }, []);

  const scanStudent = useCallback(() => {
    setScannedStudent({ ...student });
  }, [student]);

  const resetScannedStudent = useCallback(() => {
    setScannedStudent(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ isLoggedIn, isStudent, currentStudent: student, login, logout, updateCredits, scannedStudent, scanStudent, resetScannedStudent }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};
