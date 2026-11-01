// Custom hook so components can write: const { user, login } = useAuth();
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
