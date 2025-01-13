import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  import {
    checkAuthStatus,
    loginUser,
    logoutUser,
    signupUser,
  } from "../helpers/api-communicator.ts";
  type User = {
    name: string;
    email: string;  
  };
  type UserAuth = {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  };
  const AuthContext = createContext<UserAuth | null>(null);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    useEffect(() => {
      console.log("Checking initial auth status...");
      async function checkStatus() {
        try {
          const data = await checkAuthStatus();
          if (data) {
            console.log("User authenticated:", data.email);
            setUser({ email: data.email, name: data.name });
            setIsLoggedIn(true);
          } else {
            console.log("No authenticated user found");
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
        }
      }
      checkStatus();
    }, []);

    const login = async (email: string, password: string) => {
      console.log("Attempting login in AuthContext...");
      try {
        const data = await loginUser(email, password);
        if (data) {
          console.log("Login successful in AuthContext:", data.email);
          setUser({ email: data.email, name: data.name });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Login error in AuthContext:", error);
        throw error;
      }
    };

    const signup = async (name: string, email: string, password: string) => {
      console.log("Attempting signup in AuthContext...");
      try {
        const data = await signupUser(name, email, password);
        if (data) {
          console.log("Signup successful in AuthContext:", data.email);
          setUser({ email: data.email, name: data.name });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Signup error in AuthContext:", error);
        throw error;
      }
    };

    const logout = async () => {
      console.log("Attempting logout in AuthContext...");
      try {
        await logoutUser();
        console.log("Logout successful");
        setIsLoggedIn(false);
        setUser(null);
        window.location.reload();
      } catch (error) {
        console.error("Logout error in AuthContext:", error);
        throw error;
      }
    };
  
    const value = {
      user,
      isLoggedIn,
      login,
      logout,
      signup,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = () => useContext(AuthContext);