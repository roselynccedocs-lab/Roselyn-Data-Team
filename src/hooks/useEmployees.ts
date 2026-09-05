import { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { employeeService } from '../services/employeeService';
import { masterCentaurChemEmployees } from '../data/centaurChemEmployees';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(masterCentaurChemEmployees);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = employeeService.subscribeEmployees((updatedEmployees) => {
      if (updatedEmployees && updatedEmployees.length > 0) {
        setEmployees(updatedEmployees);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addEmployee = useCallback(async (employeeData: Employee) => {
    setIsSyncing(true);
    setError(null);
    try {
      const created = await employeeService.addEmployee(employeeData);
      setEmployees(prev => [created, ...prev.filter(e => e.id !== created.id)]);
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add employee';
      setError(msg);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    setIsSyncing(true);
    setError(null);
    try {
      await employeeService.updateEmployee(id, updates);
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update employee';
      setError(msg);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const resignEmployee = useCallback(async (
    id: string, 
    details: { 
      departureDate: string; 
      departureReason: string; 
      status?: EmployeeStatus;
      remarks?: string;
    }
  ) => {
    setIsSyncing(true);
    setError(null);
    try {
      await employeeService.resignEmployee(id, details);
      setEmployees(prev => prev.map(emp => {
        if (emp.id === id) {
          return {
            ...emp,
            status: details.status || 'RESIGNED',
            lifeCycleStage: 'SEPARATED',
            departureDate: details.departureDate,
            departureReason: details.departureReason,
            remarks: details.remarks || emp.remarks
          };
        }
        return emp;
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process employee resignation';
      setError(msg);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    setIsSyncing(true);
    try {
      await employeeService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete employee';
      setError(msg);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      await employeeService.seedInitialEmployees();
      const fresh = await employeeService.getEmployees();
      setEmployees(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    employees,
    isLoading,
    isSyncing,
    error,
    addEmployee,
    updateEmployee,
    resignEmployee,
    deleteEmployee,
    syncDatabase
  };
}
