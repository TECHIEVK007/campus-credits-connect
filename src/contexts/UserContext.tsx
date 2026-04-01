import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreditHistoryEntry {
  id: string;
  title: string;
  impact: number;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  credits: number;
  violation_count: number;
  history: CreditHistoryEntry[];
}

interface UserContextType {
  isLoggedIn: boolean;
  isStudent: boolean;
  currentStudent: Student | null;
  login: (rollNumber: string, password: string, asStudent: boolean) => Promise<string | null>;
  logout: () => void;
  updateCredits: (studentId: string, points: number, reason: string) => Promise<boolean>;
  addCredits: (studentId: string, points: number, reason: string) => Promise<boolean>;
  scannedStudent: Student | null;
  scanStudent: (rollNumber: string) => Promise<string | null>;
  resetScannedStudent: () => void;
  refreshCurrentStudent: () => Promise<void>;
}

const STAFF_ID = "STAFF001";
const STAFF_PASSWORD = "admin123";

const UserContext = createContext<UserContextType | undefined>(undefined);

async function fetchStudentWithHistory(rollNumber: string): Promise<Student | null> {
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("roll_number", rollNumber)
    .maybeSingle();

  if (error || !student) return null;

  const { data: history } = await supabase
    .from("credit_history")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  return {
    id: student.id,
    name: student.name,
    roll_number: student.roll_number,
    department: student.department,
    credits: student.credits,
    violation_count: student.violation_count,
    history: (history || []).map((h: any) => ({
      id: h.id,
      title: h.title,
      impact: h.impact,
      created_at: h.created_at,
    })),
  };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);

  const login = useCallback(async (idNumber: string, password: string, asStudent: boolean): Promise<string | null> => {
    if (asStudent) {
      if (password !== "ROLL") return "Invalid password";
      const student = await fetchStudentWithHistory(idNumber);
      if (!student) return "Roll number not found";
      setCurrentStudent(student);
      setIsStudent(true);
      setIsLoggedIn(true);
      return null;
    } else {
      if (idNumber !== STAFF_ID || password !== STAFF_PASSWORD) {
        return "Invalid staff credentials";
      }
      setIsStudent(false);
      setIsLoggedIn(true);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentStudent(null);
    setScannedStudent(null);
  }, []);

  const refreshCurrentStudent = useCallback(async () => {
    if (!currentStudent) return;
    const updated = await fetchStudentWithHistory(currentStudent.roll_number);
    if (updated) setCurrentStudent(updated);
  }, [currentStudent]);

  const scanStudent = useCallback(async (rollNumber: string): Promise<string | null> => {
    const student = await fetchStudentWithHistory(rollNumber);
    if (!student) return "Student not found";
    setScannedStudent(student);
    return null;
  }, []);

  const resetScannedStudent = useCallback(() => {
    setScannedStudent(null);
  }, []);

  const updateCredits = useCallback(async (studentId: string, points: number, reason: string): Promise<boolean> => {
    // Get current student data
    const { data: student } = await supabase
      .from("students")
      .select("credits, violation_count")
      .eq("id", studentId)
      .maybeSingle();

    if (!student) return false;

    const newCredits = Math.max(0, student.credits - points);
    const newCount = student.violation_count + 1;
    const isFine = newCount % 3 === 0;

    // Update student
    await supabase
      .from("students")
      .update({ credits: newCredits, violation_count: newCount })
      .eq("id", studentId);

    // Insert history
    await supabase
      .from("credit_history")
      .insert({ student_id: studentId, title: reason, impact: -points });

    // Refresh scanned student
    const { data: updated } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (updated) {
      const { data: history } = await supabase
        .from("credit_history")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setScannedStudent({
        id: updated.id,
        name: updated.name,
        roll_number: updated.roll_number,
        department: updated.department,
        credits: updated.credits,
        violation_count: updated.violation_count,
        history: (history || []).map((h: any) => ({
          id: h.id,
          title: h.title,
          impact: h.impact,
          created_at: h.created_at,
        })),
      });
    }

    return isFine;
  }, []);

  const addCredits = useCallback(async (studentId: string, points: number, reason: string): Promise<boolean> => {
    const { data: student } = await supabase
      .from("students")
      .select("credits")
      .eq("id", studentId)
      .maybeSingle();

    if (!student) return false;

    const newCredits = Math.min(800, student.credits + points);
    const isMax = newCredits >= 800;

    await supabase
      .from("students")
      .update({ credits: newCredits })
      .eq("id", studentId);

    await supabase
      .from("credit_history")
      .insert({ student_id: studentId, title: reason, impact: points });

    // Refresh scanned student
    const { data: updated } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (updated) {
      const { data: history } = await supabase
        .from("credit_history")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setScannedStudent({
        id: updated.id,
        name: updated.name,
        roll_number: updated.roll_number,
        department: updated.department,
        credits: updated.credits,
        violation_count: updated.violation_count,
        history: (history || []).map((h: any) => ({
          id: h.id,
          title: h.title,
          impact: h.impact,
          created_at: h.created_at,
        })),
      });
    }

    return isMax;
  }, []);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn, isStudent, currentStudent, login, logout,
        updateCredits, addCredits, scannedStudent, scanStudent, resetScannedStudent,
        refreshCurrentStudent,
      }}
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
