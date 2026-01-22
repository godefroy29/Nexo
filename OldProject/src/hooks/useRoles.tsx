import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'backoffice' | 'client' | 'visitor';

interface UserRoleInfo {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const useRoles = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    } else {
      setUserRoles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      setUserRoles(data?.map(item => item.role) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = () => hasRole('admin');
  const isBackoffice = () => hasRole('backoffice');
  const isClient = () => hasRole('client');
  const isVisitor = () => hasRole('visitor');

  const canManageUsers = () => isAdmin();
  const canManageListings = () => isAdmin() || isBackoffice();

  return {
    userRoles,
    loading,
    hasRole,
    isAdmin,
    isBackoffice,
    isClient,
    isVisitor,
    canManageUsers,
    canManageListings,
    refetch: fetchUserRoles
  };
};