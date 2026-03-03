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
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { useState } from 'react';
import { ApiToken, PaginatedData } from '@/types/models';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import admin from '@/routes/admin';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'API Tokens', href: '/dr-admin/api-tokens' },
];

interface Props {
  tokens: PaginatedData<ApiToken>;
}

export default function ApiTokensIndex({ tokens }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<ApiToken | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    provider: 'openai',
    token: '',
    is_active: true,
  });

  const openAddDialog = () => {
    setEditingToken(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (token: ApiToken) => {
    setEditingToken(token);
    setData({
      name: token.name,
      provider: token.provider,
      token: '', // Keep token empty on edit unless user wants to change it
      is_active: token.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingToken) {
      put(admin.apiTokens.update(editingToken.id).url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('API Token updated successfully');
        },
      });
    } else {
      post(admin.apiTokens.store().url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('API Token created successfully');
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this token?')) {
      router.delete(admin.apiTokens.destroy(id).url, {
        onSuccess: () => toast.success('API Token deleted successfully'),
      });
    }
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="API Tokens" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>API Tokens</CardTitle>
              <CardDescription>Manage your global API tokens for different providers.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add New Token</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.data.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{token.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">••••••••{token.token.slice(-4)}</code>
                    </TableCell>
                    <TableCell>
                      {token.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {token.last_used_at || 'Never'}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(token)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(token.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tokens.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No tokens found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {tokens?.meta?.last_page > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(tokens.links.prev!)}
                  disabled={!tokens.links.prev}
                >
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  Page {tokens.meta.current_page} of {tokens.meta.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(tokens.links.next!)}
                  disabled={!tokens.links.next}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingToken ? 'Edit API Token' : 'Add New API Token'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the API token.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name / Label</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. Primary OpenAI Key"
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

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
                <Label htmlFor="token">API Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={data.token}
                  onChange={(e) => setData('token', e.target.value)}
                  placeholder={editingToken ? 'Leave blank to keep current' : 'sk-...'}
                  required={!editingToken}
                />
                {editingToken && <p className="text-xs text-muted-foreground italic">Leave empty to keep current token.</p>}
                {errors.token && <p className="text-xs text-destructive">{errors.token}</p>}
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
                {editingToken ? 'Update Token' : 'Create Token'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
