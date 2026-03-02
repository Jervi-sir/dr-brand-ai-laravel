import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { OpenAiApiUsage, PaginatedData } from '@/types/models';
import { useState } from 'react';
import { index as AiUsageIndexRoute } from '@/routes/admin/ai-usage';

const breadcrumbs = [
  { title: 'Admin', href: '/admin/users' },
  { title: 'AI Usage', href: '/admin/ai-usage' },
];

interface Props {
  usage: PaginatedData<OpenAiApiUsage>;
  filters: {
    date: string | null;
  };
}

export default function AiUsageIndex({ usage, filters }: Props) {
  const [date, setDate] = useState(filters.date || '');

  const handleFilter = () => {
    router.get(
      AiUsageIndexRoute().url,
      { date: date || null },
      { preserveState: true, replace: true }
    );
  };

  const handleClear = () => {
    setDate('');
    router.get(AiUsageIndexRoute().url, {}, { preserveState: true, replace: true });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="AI Usage" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Usage Logs</CardTitle>
            <CardDescription>Track AI token usage and activity across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-2">
              <Input
                type="date"
                className="max-w-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button variant="secondary" onClick={handleFilter}>
                Filter
              </Button>
              {filters.date && (
                <Button variant="ghost" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tokens (P / C / T)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.chat?.user?.name || 'Unknown User'}
                        <div className="text-muted-foreground text-xs">{log.chat?.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.model?.display_name || log.model?.name || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{log.type}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.prompt_tokens} / {log.completion_tokens} / <span className="font-bold">{log.total_tokens}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.duration}s</TableCell>
                      <TableCell className="text-right">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {usage.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No usage logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {usage.meta?.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {usage.meta.from} to {usage.meta.to} of {usage.meta.total} entries
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(usage.links.prev!)}
                    disabled={!usage.links.prev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(usage.links.next!)}
                    disabled={!usage.links.next}
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
