import React, { createContext, useState, useContext, useMemo } from 'react';
import { Role, BillStatus } from '../types';
import { MOCK_MATERIALS, MOCK_SCHEDULES, MOCK_APPLICATIONS, MOCK_USERS, MOCK_STUDENT_ATTEMPTS, MOCK_BILLS, MOCK_COLLEGES } from '../constants';

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [studentAttempts, setStudentAttempts] = useState(MOCK_STUDENT_ATTEMPTS);
  const [assessments, setAssessments] = useState([]);
  const [bills, setBills] = useState(MOCK_BILLS);
  const [colleges, setColleges] = useState(MOCK_COLLEGES);

  const addCollege = (college) => {
    const existing = colleges.find(c => c.name.toLowerCase() === college.name.toLowerCase().trim());
    if (!existing) {
        const newCollege = { ...college, id: `col-${Date.now()}`};
        setColleges(prev => [...prev, newCollege]);
    }
  };

  const addMaterial = (material) => {
    setMaterials(prev => [...prev, { ...material, id: `mat-${Date.now()}` }]);
  };

  const addSchedule = (schedule) => {
    setSchedules(prev => [...prev, { ...schedule, id: `sch-${Date.now()}` }]);
    if (schedule.college && !colleges.some(c => c.name.toLowerCase() === schedule.college.toLowerCase().trim())) {
        addCollege({ name: schedule.college.trim(), address: '', contactPerson: '', contactEmail: '', contactPhone: '' });
    }
  };

  const approveApplication = (applicationId) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const newTrainer = {
        id: `trainer-${Date.now()}`,
        name: app.name,
        email: app.email,
        password: 'password', // Default password
        role: Role.TRAINER,
        expertise: app.expertise,
        experience: app.experience,
        phone: app.phone,
      };
      setUsers(prev => [...prev, newTrainer]);
      setApplications(prev => prev.filter(a => a.id !== applicationId));
    }
  };
  
  const addStudentAttempt = (attempt) => {
      setStudentAttempts(prev => [...prev, {...attempt, timestamp: new Date()}]);
  };

  const addApplication = (application) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newApplication = {
          ...application,
          id: `app-${Date.now()}`,
          status: 'PENDING',
        };
        setApplications(prev => [...prev, newApplication]);
        resolve();
      }, 500);
    });
  };

  const addUser = (user) => {
      const newUser = {
          ...user,
          id: `${user.role.toLowerCase()}-${Date.now()}`,
          assignedMaterialIds: user.role === Role.STUDENT ? [] : undefined,
          assignedAssessmentIds: user.role === Role.STUDENT ? [] : undefined,
      };
      setUsers(prev => [...prev, newUser]);
      if (user.role === Role.STUDENT && user.college && !colleges.some(c => c.name.toLowerCase() === user.college.toLowerCase().trim())) {
          addCollege({ name: user.college.trim(), address: '', contactPerson: '', contactEmail: '', contactPhone: '' });
      }
  };
  
  const assignMaterialsToStudent = (studentId, materialIds) => {
    setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === studentId && user.role === Role.STUDENT) {
            const existingIds = user.assignedMaterialIds || [];
            const newIds = [...new Set([...existingIds, ...materialIds])];
            return { ...user, assignedMaterialIds: newIds };
        }
        return user;
    }));
  };
  
  const addAssessment = (assessment) => {
    const newId = `asm-${Date.now()}`;
    setAssessments(prev => [...prev, { ...assessment, id: newId }]);
    return newId;
  };

  const assignAssessmentToCourse = (assessmentId, course) => {
    setUsers(prevUsers => prevUsers.map(user => {
        if (user.role === Role.STUDENT && user.course === course) {
            const existingIds = user.assignedAssessmentIds || [];
            const newIds = [...new Set([...existingIds, assessmentId])];
            return { ...user, assignedAssessmentIds: newIds };
        }
        return user;
    }));
  };

  const addBill = (bill) => {
    const totalAmount = bill.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const newBill = {
      ...bill,
      id: `bill-${Date.now()}`,
      status: BillStatus.PENDING,
      amount: totalAmount,
      invoiceNumber: `INV-2024-${String(bills.length + 1).padStart(3, '0')}`,
    };
    setBills(prev => [newBill, ...prev]);
  };

  const updateBillStatus = (billId, status) => {
    setBills(prev => prev.map(bill => bill.id === billId ? { ...bill, status } : bill));
  };

  const trainers = useMemo(() => users.filter(u => u.role === Role.TRAINER), [users]);
  const students = useMemo(() => users.filter(u => u.role === Role.STUDENT), [users]);
  
  const leaderboard = useMemo(() => {
    const scores = {};
    studentAttempts.forEach(attempt => {
        if (!scores[attempt.studentName]) {
            scores[attempt.studentName] = 0;
        }
        scores[attempt.studentName] += attempt.score;
    });
    return Object.entries(scores)
        .map(([studentName, totalScore]) => ({ studentName, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore);
  }, [studentAttempts]);

  return (
    <DataContext.Provider value={{ materials, schedules, applications, users, trainers, students, assessments, leaderboard, studentAttempts, colleges, bills, addMaterial, addSchedule, approveApplication, addStudentAttempt, addApplication, addUser, assignMaterialsToStudent, addAssessment, assignAssessmentToCourse, addCollege, addBill, updateBillStatus }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};