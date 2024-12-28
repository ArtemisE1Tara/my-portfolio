import { useState } from 'react';
import { TestCase, TestStatus } from '../types/testCase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TestCaseTableProps {
  testCases: TestCase[];
  updateTestStatus: (id: string, newStatus: TestStatus) => void;
  addTestCase: (name: string, procedure: string, notes: string) => void;
  updateTestNotes: (id: string, newNotes: string) => void;
  updateTestProcedure: (id: string, newProcedure: string) => void;
}

export function TestCaseTable({ testCases, updateTestStatus, addTestCase, updateTestNotes, updateTestProcedure }: TestCaseTableProps) {
  const [openProcedures, setOpenProcedures] = useState<string[]>([]);
  const [openNotes, setOpenNotes] = useState<string[]>([]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestProcedure, setNewTestProcedure] = useState('');
  const [newTestNotes, setNewTestNotes] = useState('');

  const toggleProcedure = (id: string) => {
    setOpenProcedures(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleNotes = (id: string) => {
    setOpenNotes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'Passed': return 'bg-green-500';
      case 'Failed': return 'bg-red-500';
      case 'Pending': return 'bg-yellow-500';
    }
  };

  const handleAddTestCase = () => {
    if (newTestName.trim() && newTestProcedure.trim()) {
      addTestCase(newTestName.trim(), newTestProcedure.trim(), newTestNotes.trim());
      setNewTestName('');
      setNewTestProcedure('');
      setNewTestNotes('');
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Procedure</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testCases.map((testCase) => (
            <TableRow key={testCase.id}>
              <TableCell>{testCase.name}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(testCase.status)}>
                  {testCase.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Collapsible open={openProcedures.includes(testCase.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => toggleProcedure(testCase.id)}>
                      {openProcedures.includes(testCase.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {openProcedures.includes(testCase.id) ? 'Hide' : 'Show'} Procedure
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Textarea
                          value={testCase.procedure}
                          onChange={(e) => updateTestProcedure(testCase.id, e.target.value)}
                          placeholder="Add procedure..."
                          className="min-h-[10px]"
                    />
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
              <TableCell>
                  <Collapsible open={openNotes.includes(testCase.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => toggleNotes(testCase.id)}>
                          {openNotes.includes(testCase.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {openNotes.includes(testCase.id) ? 'Hide' : 'Show'} Notes
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Textarea
                          value={testCase.notes}
                          onChange={(e) => updateTestNotes(testCase.id, e.target.value)}
                          placeholder="Add notes..."
                          className="min-h-[10px]"
                        />
                      </CollapsibleContent>
                  </Collapsible>
              </TableCell>
              <TableCell>
                <select
                  value={testCase.status}
                  onChange={(e) => updateTestStatus(testCase.id, e.target.value as TestStatus)}
                  className="border rounded p-1"
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <Input
                placeholder="New Test Case Name"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Badge className="bg-yellow-500">Pending</Badge>
            </TableCell>
            <TableCell>
              <Textarea
                placeholder="Test Procedure"
                value={newTestProcedure}
                onChange={(e) => setNewTestProcedure(e.target.value)}
                className="min-h-[10px]"
              />
            </TableCell>
            <TableCell>
              <Textarea
                placeholder="Test Notes"
                value={newTestNotes}
                onChange={(e) => setNewTestNotes(e.target.value)}
                className="min-h-[10px]"
              />
            </TableCell>
            <TableCell>
              <Button onClick={handleAddTestCase}>Add Test Case</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}