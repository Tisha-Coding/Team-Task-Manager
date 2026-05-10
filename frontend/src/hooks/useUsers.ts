import { useEffect, useState } from "react";
import { listUsersAPI, handleApiError } from "../services/api";

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await listUsersAPI();
      setUsers(res.data.users || []);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, error, refetch: fetchUsers };
};
