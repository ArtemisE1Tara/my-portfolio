import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "../hooks/use-toast";

export function AddTestCase({ onTestCaseAdded }: { onTestCaseAdded: () => void }) {
  const [name, setName] = useState('');
  const [procedure, setProcedure] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert([
          { name, procedure, status: 'Pending' },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test case added successfully",
      });

      setName('');
      setProcedure('');
      onTestCaseAdded();
    } catch (error) {
      console.error('Error adding test case:', error);
      toast({
        title: "Error",
        description: "Failed to add test case",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Test Case Name"
        required
      />
      <Textarea
        value={procedure}
        onChange={(e) => setProcedure(e.target.value)}
        placeholder="Test Procedure"
        required
      />
      <Button type="submit">Add Test Case</Button>
    </form>
  );
}

