'use client'

import { useTestCases } from '../hooks/useTestCases';
import { TestCaseTable } from './TestCaseTable';
import { PassFailChart } from './PassFailChart';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

export function TestCases() {
  const { testCases, loading, error, updateTestStatus, addTestCase, updateTestNotes, updateTestProcedure } = useTestCases();

  const passCount = testCases.filter(tc => tc.status === 'Passed').length;
  const failCount = testCases.filter(tc => tc.status === 'Failed').length;
  const totalCount = testCases.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TestCaseTable 
            testCases={testCases} 
            updateTestStatus={updateTestStatus} 
            addTestCase={addTestCase}
            updateTestNotes={updateTestNotes}
            updateTestProcedure={updateTestProcedure}
          />
        </div>
        <div>
          <PassFailChart passCount={passCount} failCount={failCount} totalCount={totalCount} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

