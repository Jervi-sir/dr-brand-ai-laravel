import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { useState } from 'react';
import { AiModel, PaginatedData } from '@/types/models';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import * as AiModelsRoutes from '@/routes/admin/ai-models';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'AI Models', href: '/dr-admin/ai-models' },
];

interface Props {
  models: PaginatedData<AiModel>;
}

export default function AiModelsIndex({ models }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AiModel | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    display_name: '',
    provider: '',
    endpoint: '',
    api_key: '',
    capability: '',
    type: '',
    is_active: true,
    max_tokens: 4096,
    temperature: 70,
    custom_prompts: '',
    input_price: '0',
    output_price: '0',
    cached_input_price: '0',
  });

  const openAddDialog = () => {
    setEditingModel(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (model: AiModel) => {
    setEditingModel(model);
    setData({
      name: model.name,
      display_name: model.display_name,
      provider: model.provider,
      endpoint: model.endpoint || '',
      api_key: model.api_key || '',
      capability: model.capability || '',
      type: model.type || '',
      is_active: model.is_active,
      max_tokens: model.max_tokens ?? 4096,
      temperature: model.temperature ?? 70,
      custom_prompts: model.custom_prompts || '',
      input_price: model.input_price || '0',
      output_price: model.output_price || '0',
      cached_input_price: model.cached_input_price || '0',
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModel) {
      put(AiModelsRoutes.update(editingModel.id).url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Model updated successfully');
        },
      });
    } else {
      post(AiModelsRoutes.store().url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Model created successfully');
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this model?')) {
      router.delete(AiModelsRoutes.destroy(id).url, {
        onSuccess: () => toast.success('Model deleted successfully'),
      });
    }
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="AI Models" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI Models</CardTitle>
              <CardDescription>Manage your AI models and providers.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add New Model</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.data.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="font-medium">{model.display_name}</div>
                      <div className="text-muted-foreground text-xs">{model.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      {model.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(model)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(model.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {models.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No models found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {models?.meta?.last_page > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(models.links.prev!)}
                  disabled={!models.links.prev}
                >
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  Page {models.meta.current_page} of {models.meta.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(models.links.next!)}
                  disabled={!models.links.next}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingModel ? 'Edit AI Model' : 'Add New AI Model'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the AI model.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={data.display_name}
                    onChange={(e) => setData('display_name', e.target.value)}
                    placeholder="e.g. GPT-4o"
                    required
                  />
                  {errors.display_name && <p className="text-xs text-destructive">{errors.display_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name / ID</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. gpt-4o"
                    required
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={data.provider}
                    onValueChange={(value) => setData('provider', value)}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="cohere">Cohere</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.provider && <p className="text-xs text-destructive">{errors.provider}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Model Type</Label>
                  <Input
                    id="type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    placeholder="e.g. chat, completions"
                  />
                  {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL (Optional)</Label>
                <Input
                  id="endpoint"
                  value={data.endpoint}
                  onChange={(e) => setData('endpoint', e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
                {errors.endpoint && <p className="text-xs text-destructive">{errors.endpoint}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capability">Capability Configuration</Label>
                <Textarea
                  id="capability"
                  value={data.capability}
                  onChange={(e) => setData('capability', e.target.value)}
                  placeholder="Describe the model capabilities or add a configuration..."
                  className="min-h-[80px]"
                />
                {errors.capability && <p className="text-xs text-destructive">{errors.capability}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={data.max_tokens}
                    onChange={(e) => setData('max_tokens', parseInt(e.target.value))}
                  />
                  {errors.max_tokens && <p className="text-xs text-destructive">{errors.max_tokens}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (0-100)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={data.temperature}
                    onChange={(e) => setData('temperature', parseInt(e.target.value))}
                  />
                  {errors.temperature && <p className="text-xs text-destructive">{errors.temperature}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input_price">Input Price</Label>
                  <Input
                    id="input_price"
                    value={data.input_price}
                    onChange={(e) => setData('input_price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output_price">Output Price</Label>
                  <Input
                    id="output_price"
                    value={data.output_price}
                    onChange={(e) => setData('output_price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cached_input_price">Cached Price</Label>
                  <Input
                    id="cached_input_price"
                    value={data.cached_input_price}
                    onChange={(e) => setData('cached_input_price', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Status</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {editingModel ? 'Update Model' : 'Create Model'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
