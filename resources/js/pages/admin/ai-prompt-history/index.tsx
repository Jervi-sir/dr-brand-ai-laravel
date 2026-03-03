import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { PromptHistory, PaginatedData } from '@/types/models';
import { useState } from 'react';
import * as PromptHistoryRoutes from '@/routes/admin/ai-prompt-history';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'AI Prompt History', href: '/dr-admin/ai-prompt-history' },
];

interface Props {
  history: PaginatedData<PromptHistory>;
  filters: {
    search?: string;
  };
}

export default function AiPromptHistoryIndex({ history, filters }: Props) {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptHistory | null>(null);
  const { data, setData, get } = useForm({
    search: filters.search || '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get(PromptHistoryRoutes.index().url, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="AI Prompt History" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Prompt History</CardTitle>
            <CardDescription>View historical prompts sent to AI models.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="mb-4 flex items-center gap-4">
              <Input
                placeholder="Search by user email or prompt content..."
                className="max-w-sm"
                value={data.search}
                onChange={(e) => setData('search', e.target.value)}
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Prompt Snippet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.userEmail || 'System/Guest'}</TableCell>
                    <TableCell>{item.ai_model?.display_name || item.ai_model?.name || 'Unknown'}</TableCell>
                    <TableCell className="max-w-[400px] truncate">
                      {item.prompt}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPrompt(item)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {history.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No prompt history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {history.meta?.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {history.meta.from} to {history.meta.to} of {history.meta.total} entries
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(history.links.prev!)}
                    disabled={!history.links.prev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(history.links.next!)}
                    disabled={!history.links.next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
            <DialogDescription>
              Prompt sent to {selectedPrompt?.ai_model?.display_name || 'AI'} on {selectedPrompt && new Date(selectedPrompt.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex-1 overflow-y-auto rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
            {selectedPrompt?.prompt}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setSelectedPrompt(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
