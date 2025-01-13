import axios, { AxiosError } from "axios";

export const loginUser = async (email: string, password: string) => {
  console.log(`Attempting to login user: ${email}`);
  try {
    const res = await axios.post("/user/login", { email, password });
    console.log(`Login response status: ${res.status}`);
    if (res.status !== 200) {
      console.error(`Login failed with status: ${res.status}`);
      throw new Error("Unable to login");
    }
    const data = await res.data;
    console.log("Login successful");
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Login error:", axiosError.response?.data || axiosError.message);
    throw error;
  }
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  console.log(`Attempting to signup user: ${email}`);
  try {
    const res = await axios.post("/user/signup", { name, email, password });
    console.log(`Signup response status: ${res.status}`);
    if (res.status !== 201) {
      console.error(`Signup failed with status: ${res.status}`);
      throw new Error("Unable to Signup");
    }
    const data = await res.data;
    console.log("Signup successful");
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Signup error:", axiosError.response?.data || axiosError.message);
    throw error;
  }
};

export const checkAuthStatus = async () => {
  console.log("Checking authentication status...");
  try {
    const res = await axios.get("/user/auth-status");
    console.log(`Auth status response: ${res.status}`);
    if (res.status !== 200) {
      console.error(`Auth check failed with status: ${res.status}`);
      throw new Error("Unable to authenticate");
    }
    const data = await res.data;
    console.log("Auth status check successful:", data);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Auth status check error:", axiosError.response?.data || axiosError.message);
    throw error;
  }
};

export const sendChatRequest = async (message: string, image?: File) => {
  const formData = new FormData();
  formData.append('message', message);
  if (image) {
    console.log("Appending image to FormData:", image.name, image.type, image.size);
    formData.append('image', image);
    
    // Log FormData contents
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
  }

  try {
    console.log("Sending request to /chat/new");
    const res = await axios.post("/chat/new", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("Response status:", res.status);
    console.log("Response data:", res.data);

    if (res.status !== 200) {
      throw new Error("Unable to send chat");
    }
    const data = await res.data;
    return data;
  } catch (error) {
    console.error("Error in sendChatRequest:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getUserChats = async () => {
  const res = await axios.get("/chat/all-chats");
  if (res.status !== 200) {
    throw new Error("Unable to send chat");
  }
  const data = await res.data;
  return data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};