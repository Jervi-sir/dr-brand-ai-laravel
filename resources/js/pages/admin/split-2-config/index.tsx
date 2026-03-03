import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { AiModel, PromptHistory } from '@/types/models';
import Update from '@/actions/App/Http/Controllers/Admin/Split2ConfigController';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'Split 2 Config', href: '/dr-admin/split-2-config' },
];

interface Props {
  models: AiModel[];
  currentConfig: PromptHistory | null;
  history: PromptHistory[];
}

export default function Split2ConfigIndex({ models, currentConfig, history }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    model_id: currentConfig?.model_id?.toString() || '',
    prompt: currentConfig?.prompt || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(Update.url());
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Split 2 Configuration" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Split 2 Config</CardTitle>
              <CardDescription>Configure the AI model and prompt for Split 2.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select
                    value={data.model_id}
                    onValueChange={(value) => setData('model_id', value)}
                  >
                    <SelectTrigger id="ai-model" className='w-full'>
                      <SelectValue placeholder="Select an AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.display_name} ({model.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.model_id && <p className="text-sm text-red-500">{errors.model_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="Enter system prompt for Split 2..."
                    rows={12}
                    value={data.prompt}
                    onChange={(e) => setData('prompt', e.target.value)}
                  />
                  {errors.prompt && <p className="text-sm text-red-500">{errors.prompt}</p>}
                </div>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Configuration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Split 2 Prompt History</CardTitle>
                <CardDescription>Recent prompt executions for Split 2.</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <a href="/dr-admin/split-2-prompt-history">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.ai_model?.display_name || 'Deleted Model'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.id === currentConfig?.id && (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                            Current
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
