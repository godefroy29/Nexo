import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRoles, UserRole } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Settings, AlertTriangle, Shield, Eye } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  company_name: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  roles: UserRole[];
}

interface Listing {
  id: string;
  title: string;
  user_id: string;
  status: string;
  disabled_by_admin: boolean;
  disabled_reason: string | null;
  profiles: {
    company_name: string;
  };
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [disableReason, setDisableReason] = useState('');

  useEffect(() => {
    if (!rolesLoading && !isAdmin()) {
      navigate('/');
      return;
    }
    if (isAdmin()) {
      fetchData();
    }
  }, [isAdmin, rolesLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch users with their profiles and roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          company_name,
          first_name,
          last_name,
          is_verified
        `);

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: roles?.filter(role => role.user_id === profile.user_id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);

      // Fetch listings and profiles separately, then combine them
      const [listingsResponse, profilesResponse] = await Promise.all([
        supabase
          .from('listings')
          .select(`
            id,
            title,
            user_id,
            status,
            disabled_by_admin,
            disabled_reason
          `),
        supabase
          .from('profiles')
          .select('user_id, company_name')
      ]);

      if (listingsResponse.error) throw listingsResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      // Combine listings with profile data
      const listingsWithProfiles = listingsResponse.data?.map(listing => ({
        ...listing,
        profiles: profilesResponse.data?.find(profile => profile.user_id === listing.user_id) || { company_name: 'Unknown' }
      })) || [];

      setListings(listingsWithProfiles);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, role: UserRole) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      const hasRole = user.roles.includes(role);

      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      await fetchData();
      toast({
        title: "Success",
        description: `Role ${hasRole ? 'removed' : 'added'} successfully`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const toggleListingDisabled = async (listingId: string, disable: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          disabled_by_admin: disable,
          disabled_reason: disable ? disableReason : null
        })
        .eq('id', listingId);

      if (error) throw error;

      await fetchData();
      setSelectedListing('');
      setDisableReason('');
      toast({
        title: "Success",
        description: `Listing ${disable ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  if (rolesLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Test Accounts Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test Accounts
            </CardTitle>
            <CardDescription>
              Use these accounts to test different roles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge variant="destructive" className="mb-2">Admin</Badge>
                <p className="text-sm font-mono">admin@test.com</p>
                <p className="text-sm font-mono">admin123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">Backoffice</Badge>
                <p className="text-sm font-mono">backoffice@test.com</p>
                <p className="text-sm font-mono">backoffice123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge variant="default" className="mb-2">Client</Badge>
                <p className="text-sm font-mono">seller@test.com</p>
                <p className="text-sm font-mono">seller123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge variant="outline" className="mb-2">Visitor</Badge>
                <p className="text-sm font-mono">buyer@test.com</p>
                <p className="text-sm font-mono">buyer123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.company_name}</TableCell>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role.replace('_', '-')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {(['admin', 'backoffice', 'client', 'visitor'] as UserRole[]).map(role => (
                          <Button
                            key={role}
                            size="sm"
                            variant={user.roles.includes(role) ? "destructive" : "outline"}
                            onClick={() => toggleUserRole(user.user_id, role)}
                          >
                            {user.roles.includes(role) ? 'Remove' : 'Add'} {role.replace('_', '-')}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Listing Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Listing Management
            </CardTitle>
            <CardDescription>
              Enable or disable listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="listing-select">Select Listing</Label>
                <Select value={selectedListing} onValueChange={setSelectedListing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a listing to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {listings.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.title} - {listing.profiles?.company_name}
                        {listing.disabled_by_admin && ' (DISABLED)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedListing && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="disable-reason">Reason for disabling (optional)</Label>
                    <Textarea
                      id="disable-reason"
                      placeholder="Enter reason for disabling this listing..."
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => toggleListingDisabled(selectedListing, true)}
                      disabled={listings.find(l => l.id === selectedListing)?.disabled_by_admin}
                    >
                      Disable Listing
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleListingDisabled(selectedListing, false)}
                      disabled={!listings.find(l => l.id === selectedListing)?.disabled_by_admin}
                    >
                      Enable Listing
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell>{listing.profiles?.company_name}</TableCell>
                    <TableCell>
                      <Badge variant={listing.status === 'published' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {listing.disabled_by_admin ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {listing.disabled_reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;