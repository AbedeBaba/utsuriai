import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Edit, RefreshCw, Shield } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  plan: 'trial' | 'starter' | 'pro' | 'creator';
  credits_remaining: number;
  pro_generations_remaining: number;
  standard_generations_remaining: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    plan: 'trial' as 'trial' | 'starter' | 'pro' | 'creator',
    credits_remaining: 0,
    pro_generations_remaining: 0,
    standard_generations_remaining: 0,
  });

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAdmin, isAdminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.email?.toLowerCase().includes(query) ||
            u.first_name?.toLowerCase().includes(query) ||
            u.last_name?.toLowerCase().includes(query) ||
            u.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'list_users' },
      });

      if (error) throw error;
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (userData: UserData) => {
    setSelectedUser(userData);
    setEditForm({
      plan: userData.plan,
      credits_remaining: userData.credits_remaining,
      pro_generations_remaining: userData.pro_generations_remaining,
      standard_generations_remaining: userData.standard_generations_remaining,
    });
    setEditDialogOpen(true);
  };

  const handlePlanChange = async (newPlan: 'trial' | 'starter' | 'pro' | 'creator') => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_plan',
          user_id: selectedUser.id,
          plan: newPlan,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Plan updated to ${newPlan}`,
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive',
      });
    }
  };

  const handleCreditsUpdate = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_credits',
          user_id: selectedUser.id,
          credits_remaining: editForm.credits_remaining,
          pro_generations_remaining: editForm.pro_generations_remaining,
          standard_generations_remaining: editForm.standard_generations_remaining,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Credits updated successfully',
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update credits',
        variant: 'destructive',
      });
    }
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Control Panel</h1>
          </div>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Pro Gen.</TableHead>
                <TableHead className="text-right">Std Gen.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">{userData.email}</TableCell>
                    <TableCell>
                      {userData.first_name || userData.last_name
                        ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData.plan === 'trial'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            : userData.plan === 'starter'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : userData.plan === 'pro'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{userData.credits_remaining}</TableCell>
                    <TableCell className="text-right">{userData.pro_generations_remaining}</TableCell>
                    <TableCell className="text-right">{userData.standard_generations_remaining}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(userData)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Total users: {users.length}
        </p>
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editForm.plan} onValueChange={(v) => handlePlanChange(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing plan will reset credits according to plan defaults.
              </p>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Manual Credit Adjustment</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Manually set credits without changing the plan.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Credits</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.credits_remaining}
                    onChange={(e) =>
                      setEditForm({ ...editForm, credits_remaining: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pro Gen.</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.pro_generations_remaining}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pro_generations_remaining: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Std Gen.</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.standard_generations_remaining}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        standard_generations_remaining: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreditsUpdate}>Update Credits</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
