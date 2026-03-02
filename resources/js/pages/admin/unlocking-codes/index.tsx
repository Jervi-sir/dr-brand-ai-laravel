import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { useState } from 'react';
import { Code, PaginatedData } from '@/types/models';
import { toast } from 'sonner';
import * as UnlockingCodesRoutes from '@/routes/admin/unlocking-codes';

const breadcrumbs = [
  { title: 'Admin', href: '/admin/users' },
  { title: 'Unlocking Codes', href: '/admin/unlocking-codes' },
];

interface Props {
  codes: PaginatedData<Code>;
}

export default function UnlockingCodesIndex({ codes }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Code | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    code: '',
    max_uses: 1,
    is_active: true,
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BETA-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setData('code', result);
  };

  const openAddDialog = () => {
    setEditingCode(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (code: Code) => {
    setEditingCode(code);
    setData({
      code: code.code,
      max_uses: code.max_uses,
      is_active: code.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCode) {
      put(UnlockingCodesRoutes.update(editingCode.id).url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Code updated successfully');
        },
      });
    } else {
      post(UnlockingCodesRoutes.store().url, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Code created successfully');
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to revoke this code? This action cannot be undone.')) {
      router.delete(UnlockingCodesRoutes.destroy(id).url, {
        onSuccess: () => toast.success('Code revoked successfully'),
      });
    }
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Unlocking Codes" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Unlocking Codes</CardTitle>
              <CardDescription>Manage codes used to unlock platform features.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>Generate New Code</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage (Used / Max)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.data.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-medium">{code.code}</TableCell>
                    <TableCell>
                      {code.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.usages?.length || 0} / {code.max_uses}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(code)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(code.id)}>
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {codes.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No unlocking codes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {codes.meta?.last_page > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(codes.links.prev!)}
                  disabled={!codes.links.prev}
                >
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  Page {codes.meta.current_page} of {codes.meta.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(codes.links.next!)}
                  disabled={!codes.links.next}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit Unlocking Code' : 'Generate New Code'}</DialogTitle>
              <DialogDescription>
                Configure the unlocking code and its limitations.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    placeholder="BETA-XXXX-XXXX"
                    required
                    className="font-mono"
                  />
                  {!editingCode && (
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Generate
                    </Button>
                  )}
                </div>
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Maximum Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={data.max_uses}
                  onChange={(e) => setData('max_uses', parseInt(e.target.value))}
                  required
                />
                {errors.max_uses && <p className="text-xs text-destructive">{errors.max_uses}</p>}
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
                {editingCode ? 'Update Code' : 'Create Code'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
