import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { AiModel } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'Split 1 Config', href: '/dr-admin/split-1-config' },
];

interface Props {
  models: AiModel[];
  currentConfig: {
    model_id: number;
    is_active: boolean;
  } | null;
}

export default function Split1ConfigIndex({ models, currentConfig }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    model_id: currentConfig?.model_id?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dr-admin/split-1-config');
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Split 1 Configuration" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Split 1 Model Selection</CardTitle>
              <CardDescription>Select the AI model to use for Split 1 features.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select
                    value={data.model_id}
                    onValueChange={(value) => setData('model_id', value)}
                  >
                    <SelectTrigger id="ai-model" className="w-full">
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
                  {errors.model_id && (
                    <p className="text-sm font-medium text-destructive">{errors.model_id}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  {currentConfig && (
                    <p className="text-sm text-muted-foreground">
                      Current model: {models.find(m => m.id === currentConfig.model_id)?.display_name || 'Unknown'}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
