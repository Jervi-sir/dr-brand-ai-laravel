import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { useState } from 'react';
import { toast } from 'sonner';
import admin from '@/routes/admin';

interface GoogleSetting {
  id: number;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  is_active: boolean;
}

interface Props {
  settings: GoogleSetting;
}

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'Google Auth Settings', href: '/dr-admin/google-settings' },
];

export default function GoogleSettingsIndex({ settings }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    client_id: settings?.client_id || '',
    client_secret: settings?.client_secret || '',
    redirect_uri: settings?.redirect_uri || '',
    is_active: settings?.is_active ?? true,
  });

  const openEditDialog = () => {
    setData({
      client_id: settings?.client_id || '',
      client_secret: settings?.client_secret || '',
      redirect_uri: settings?.redirect_uri || '',
      is_active: settings?.is_active ?? true,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.google-settings.update'), {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast.success('Google settings updated successfully');
      },
    });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Google Auth Settings" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Google Auth Settings</CardTitle>
              <CardDescription>Configure your Google OAuth credentials for authentication.</CardDescription>
            </div>
            <Button onClick={openEditDialog}>Edit Settings</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Client Secret</TableHead>
                  <TableHead>Redirect URI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">{settings?.client_id || 'Not set'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {settings?.client_secret ? '••••••••••••••••' : 'Not set'}
                  </TableCell>
                  <TableCell className="text-xs">{settings?.redirect_uri || 'Not set'}</TableCell>
                  <TableCell>
                    {settings?.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Google Auth Settings</DialogTitle>
              <DialogDescription>
                Update your Google OAuth credentials. These will be used for Socialite authentication.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  value={data.client_id}
                  onChange={(e) => setData('client_id', e.target.value)}
                  placeholder="your-google-client-id.apps.googleusercontent.com"
                  required
                />
                {errors.client_id && <p className="text-xs text-destructive">{errors.client_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_secret">Client Secret</Label>
                <Input
                  id="client_secret"
                  type="text"
                  value={data.client_secret}
                  onChange={(e) => setData('client_secret', e.target.value)}
                  placeholder="GOCSPX-..."
                  required
                />
                {errors.client_secret && <p className="text-xs text-destructive">{errors.client_secret}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect_uri">Redirect URI</Label>
                <Input
                  id="redirect_uri"
                  value={data.redirect_uri}
                  onChange={(e) => setData('redirect_uri', e.target.value)}
                  placeholder="https://your-domain.com/auth/google/callback"
                />
                <p className="text-xs text-muted-foreground">Usually: {window.location.origin}/auth/google/callback</p>
                {errors.redirect_uri && <p className="text-xs text-destructive">{errors.redirect_uri}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Enable Google Login</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// @ts-ignore
function route(name: string) {
  if (name === 'admin.google-settings.update') return '/dr-admin/google-settings';
  return '';
}
