import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Edit, RefreshCw, Shield, Plus, Minus, Trash2, User, CreditCard, Crown } from 'lucide-react';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quickAddCredits, setQuickAddCredits] = useState(100);
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
            u.last_name?.toLowerCase().includes(query)
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

  const handleQuickCredits = async (userData: UserData, amount: number) => {
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_credits',
          user_id: userData.id,
          add_credits: amount,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} credits`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update credits',
        variant: 'destructive',
      });
    }
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'delete_user',
          user_id: selectedUser.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: `${selectedUser.email} has been deleted`,
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'trial':
        return 'bg-muted text-muted-foreground';
      case 'starter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'creator':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-muted text-muted-foreground';
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
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find User by Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Enter email address to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{filteredUsers.length} of {users.length} users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Credits */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Quick Credit Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Label className="text-sm">Default amount:</Label>
              <Input
                type="number"
                min="1"
                value={quickAddCredits}
                onChange={(e) => setQuickAddCredits(parseInt(e.target.value) || 100)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">No users found</p>
            </Card>
          ) : (
            filteredUsers.map((userData) => (
              <Card key={userData.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{userData.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.first_name || userData.last_name
                            ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                            : 'No name set'}
                        </p>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeClass(userData.plan)}`}>
                        <Crown className="h-3 w-3 mr-1" />
                        {userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1)}
                      </span>
                    </div>

                    {/* Credits Display */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-lg">{userData.credits_remaining}</p>
                        <p className="text-muted-foreground text-xs">Credits</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{userData.pro_generations_remaining}</p>
                        <p className="text-muted-foreground text-xs">Pro</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{userData.standard_generations_remaining}</p>
                        <p className="text-muted-foreground text-xs">Standard</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => handleQuickCredits(userData, quickAddCredits)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {quickAddCredits}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                        onClick={() => handleQuickCredits(userData, -quickAddCredits)}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        {quickAddCredits}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(userData)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedUser(userData);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <Select value={editForm.plan} onValueChange={(v) => handlePlanChange(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (2 Pro + 5 Standard)</SelectItem>
                  <SelectItem value="starter">Starter (100 credits)</SelectItem>
                  <SelectItem value="pro">Pro (400 credits)</SelectItem>
                  <SelectItem value="creator">Creator (1000 credits)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ⚠️ Changing plan will reset credits to plan defaults
              </p>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Manual Override</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Set exact values without changing the plan
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
            <Button onClick={handleCreditsUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.email}</strong>? 
              This action cannot be undone and will permanently remove all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
