import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout/admin-layout';

const breadcrumbs = [
  { title: 'Admin', href: '/admin/users' },
  { title: 'Split 2 Prompt History', href: '/admin/split-2-prompt-history' },
];

export default function Split2PromptHistoryIndex() {
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Split 2 Prompt History" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Split 2 Prompt History</CardTitle>
            <CardDescription>All prompt executions for the Split 2 feature.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Execution Date</TableHead>
                  <TableHead>Input Tokens</TableHead>
                  <TableHead>Output Tokens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2026-03-02 12:00:00</TableCell>
                  <TableCell>1,234</TableCell>
                  <TableCell>456</TableCell>
                  <TableCell>Success</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
