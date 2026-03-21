import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout/admin-layout';
import { User, PaginatedData } from '@/types/models';
import { toast } from 'sonner';
import * as UsersRoutes from '@/routes/admin/users';

const breadcrumbs = [
  { title: 'Admin', href: '/dr-admin/users' },
  { title: 'Users', href: '/dr-admin/users' },
];

interface Props {
  users: PaginatedData<User>;
  filters: {
    search?: string;
  };
}

export default function UsersIndex({ users, filters }: Props) {
  const { data, setData, get } = useForm({
    search: filters.search || '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get(UsersRoutes.index().url, {
      preserveState: true,
      replace: true,
    });
  };

  const handleApprove = (id: number) => {
    router.post(UsersRoutes.approve(id).url, {}, {
      onSuccess: () => toast.success('User approved successfully'),
    });
  };

  const handleUnapprove = (id: number) => {
    router.post(UsersRoutes.unapprove(id).url, {}, {
      onSuccess: () => toast.success('User unapproved successfully'),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Wayfinder might not have auto-generated the TS for the new DELETE route yet in the exact way I expect
      // but wayfinder:generate was run. Let's try to use the route name if possible or just use router.delete directly.
      router.delete(UsersRoutes.destroy(id).url, {
        onSuccess: () => toast.success('User deleted successfully'),
      });
    }
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Users" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage your platform users.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="mb-4 flex items-center gap-4">
              <Input
                placeholder="Search users by name, email or code..."
                className="max-w-sm"
                value={data.search}
                onChange={(e) => setData('search', e.target.value)}
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {user.is_verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnapprove(user.id)}
                        >
                          Unapprove
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {users.meta?.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {users.meta.from} to {users.meta.to} of {users.meta.total} entries
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(users.links.prev!)}
                    disabled={!users.links.prev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.get(users.links.next!)}
                    disabled={!users.links.next}
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
