import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/utils/common/Logger';

interface UserProviderProps {
	children: ReactNode;
}

interface UserContextProp {
	user: any;
	setUser: (user: any) => void;
}
const UserContext = createContext<UserContextProp>({} as UserContextProp);

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUserState] = useState<any>({});

	const setUser = useCallback((next: any) => {
		setUserState(next);
		try {
			if (next == null) {
				localStorage.removeItem('user');
			} else {
				localStorage.setItem('user', JSON.stringify(next));
			}
		} catch (error) {
			logger.error(error);
		}
	}, []);

	useEffect(() => {
		try {
			const userData = localStorage.getItem('user');
			if (userData) {
				const parsed = JSON.parse(userData);
				setUserState(parsed);
			}
		} catch (error) {
			logger.error(error);
			// Clear invalid user data but don't trigger logout to prevent infinite redirects
			localStorage.removeItem('user');
			setUserState(null);
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
