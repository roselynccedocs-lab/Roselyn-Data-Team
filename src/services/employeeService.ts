import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Employee, EmployeeStatus } from '../types';
import { masterCentaurChemEmployees } from '../data/centaurChemEmployees';

const COLLECTION_NAME = 'employees';
const LOCAL_STORAGE_KEY = 'centaur_chem_employees_cache_v2';
let isEmployeeSeeding = false;

export const employeeService = {
  // Get all employees (with cache fallback)
  async getEmployees(): Promise<Employee[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      
      if (!snapshot.empty) {
        const employees: Employee[] = [];
        snapshot.forEach((docSnap) => {
          employees.push({ id: docSnap.id, ...(docSnap.data() as Omit<Employee, 'id'>) });
        });
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees)); } catch (e) {}
        return employees;
      } else {
        // If Firestore is empty, seed with master dataset
        if (!isEmployeeSeeding) {
          isEmployeeSeeding = true;
          await this.seedInitialEmployees();
        }
        return masterCentaurChemEmployees;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      // Fallback to local cache or master data
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}
      return masterCentaurChemEmployees;
    }
  },

  // Subscribe to real-time updates
  subscribeEmployees(callback: (employees: Employee[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    
    // Initial check from localStorage
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        callback(JSON.parse(cached));
      } else {
        callback(masterCentaurChemEmployees);
      }
    } catch (e) {
      callback(masterCentaurChemEmployees);
    }

    const unsubscribe = onSnapshot(
      colRef, 
      (snapshot) => {
        if (!snapshot.empty) {
          const employees: Employee[] = [];
          snapshot.forEach((docSnap) => {
            employees.push({ id: docSnap.id, ...(docSnap.data() as Omit<Employee, 'id'>) });
          });
          try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees)); } catch (e) {}
          callback(employees);
        } else {
          // Attempt seeding only once
          if (!isEmployeeSeeding) {
            isEmployeeSeeding = true;
            this.seedInitialEmployees().then(() => {
              callback(masterCentaurChemEmployees);
            }).catch(() => {
              callback(masterCentaurChemEmployees);
            });
          } else {
            callback(masterCentaurChemEmployees);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      }
    );

    return unsubscribe;
  },

  // Seed master roster to Firestore in batches
  async seedInitialEmployees(): Promise<void> {
    try {
      const batch = writeBatch(db);
      masterCentaurChemEmployees.forEach((emp) => {
        const docRef = doc(db, COLLECTION_NAME, emp.id);
        batch.set(docRef, {
          ...emp,
          updatedAt: Date.now()
        }, { merge: true });
      });
      await batch.commit();
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(masterCentaurChemEmployees)); } catch (e) {}
      console.log('Centaur Chem Enterprise master roster synced to Firestore');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(masterCentaurChemEmployees)); } catch (e) {}
    }
  },

  // Add new employee
  async addEmployee(employee: Employee): Promise<Employee> {
    const newEmp: Employee = {
      ...employee,
      fullName: employee.fullName || `${employee.lastName.toUpperCase()}, ${employee.firstName.toUpperCase()}${employee.middleName ? ' ' + employee.middleName.toUpperCase() : ''}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, newEmp.id);
      await setDoc(docRef, newEmp);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newEmp.id}`);
    }

    // Update local cache
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      let list: Employee[] = cached ? JSON.parse(cached) : [...masterCentaurChemEmployees];
      list = [newEmp, ...list.filter(e => e.id !== newEmp.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}

    return newEmp;
  },

  // Update employee profile
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
    const enrichedUpdates = {
      ...updates,
      updatedAt: Date.now()
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, enrichedUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    // Update local cache
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const list: Employee[] = JSON.parse(cached);
        const index = list.findIndex(e => e.id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...enrichedUpdates };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        }
      }
    } catch {
      // ignore
    }
  },

  // Process resignation / separation
  async resignEmployee(
    id: string, 
    details: { 
      departureDate: string; 
      departureReason: string; 
      status?: EmployeeStatus;
      remarks?: string;
    }
  ): Promise<void> {
    const updates: Partial<Employee> = {
      status: details.status || 'RESIGNED',
      lifeCycleStage: 'SEPARATED',
      departureDate: details.departureDate,
      departureReason: details.departureReason,
      remarks: details.remarks || `Separated on ${details.departureDate} (${details.departureReason})`,
      updatedAt: Date.now()
    };

    await this.updateEmployee(id, updates);
  },

  // Delete employee record
  async deleteEmployee(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const list: Employee[] = JSON.parse(cached);
        const filtered = list.filter(e => e.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  }
};
