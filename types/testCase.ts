export type TestStatus = 'Passed' | 'Failed' | 'Pending';

export interface TestCase {
  id: string;
  name: string;
  status: TestStatus;
  procedure: string;
  notes: string;
}

