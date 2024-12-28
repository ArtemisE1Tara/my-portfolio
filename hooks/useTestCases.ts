import { useState, useEffect, useCallback } from 'react';
import { TestCase, TestStatus } from '../types/testCase';
import { supabase } from '../lib/supabase';
import { useToast } from "../hooks/use-toast";

export function useTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTestCases(data);
    } catch (error) {
      setError('Failed to fetch test cases');
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = useCallback(async (id: string, newStatus: TestStatus) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setTestCases(prevCases =>
        prevCases.map(testCase =>
          testCase.id === id ? { ...testCase, status: newStatus } : testCase
        )
      );

      toast({
        title: "Success",
        description: "Test case status updated successfully",
      });
    } catch (error) {
      console.error('Error updating test case status:', error);
      toast({
        title: "Error",
        description: "Failed to update test case status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addTestCase = useCallback(async (name: string, procedure: string, notes: string) => {
    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert([
          {
            name: name.trim(),
            procedure: procedure.trim(),
            notes: notes.trim(),
            status: 'Pending'
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setTestCases(prevCases => [data[0], ...prevCases]);
      }

      toast({
        title: "Success",
        description: "Test case added successfully",
      });
    } catch (error) {
      console.error('Error adding test case:', error);
      toast({
        title: "Error",
        description: "Failed to add test case",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateTestNotes = useCallback(async (id: string, newNotes: string) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .update({ notes: newNotes.trim() })
        .eq('id', id);

      if (error) throw error;

      setTestCases(prevCases =>
        prevCases.map(testCase =>
          testCase.id === id ? { ...testCase, notes: newNotes.trim() } : testCase
        )
      );

      toast({
        title: "Success",
        description: "Test case notes updated successfully",
      });
    } catch (error) {
      console.error('Error updating test case notes:', error);
      toast({
        title: "Error",
        description: "Failed to update test case notes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateTestProcedure = useCallback(async (id: string, newProcedure: string) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .update({ procedure: newProcedure.trim() })
        .eq('id', id);

      if (error) throw error;

      setTestCases(prevCases =>
        prevCases.map(testCase =>
          testCase.id === id ? { ...testCase, procedure: newProcedure.trim() } : testCase
        )
      );

      toast({
        title: "Success",
        description: "Test case procedure updated successfully",
      });
    } catch (error) {
      console.error('Error updating test case procedure:', error);
      toast({
        title: "Error",
        description: "Failed to update test case procedure",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { testCases, loading, error, updateTestStatus, addTestCase, updateTestNotes, updateTestProcedure };
}

