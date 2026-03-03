import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { PaginatedData, SplitPromptHistory } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'Split 2 Config', href: '/dr-admin/split-2-config' },
  { title: 'Prompt History', href: '/dr-admin/split-2-prompt-history' },
];

interface Props {
  history: PaginatedData<SplitPromptHistory>;
}

export default function Split2PromptHistoryIndex({ history }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Split 2 Prompt History" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Split 2 Prompt History</CardTitle>
            <CardDescription>All prompt executions and configurations for the Split 2 feature.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Execution Date</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Configured By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">System Prompt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleRow(item.id)}
                    >
                      <TableCell className="font-medium">
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.ai_model?.display_name || 'Deleted Model'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.user_email || 'System'}</TableCell>
                      <TableCell>
                        {item.is_current && (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                            Current
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {expandedRows.has(item.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(item.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={5} className="p-4">
                          <div className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                            {item.prompt}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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

            {history.meta && history.meta.last_page > 1 && (
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
    </AdminLayout>
  );
}
