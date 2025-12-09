import axios from 'axios';

export async function handleLogin(email, password) {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/login`,
      { email, password },
      { withCredentials: true } // কুকি/সেশন ব্যবহার করতে হলে
    );

    if (response.data.success) {
      console.log("✅ Login successful:", response.data);
      return response.data;
    } else {
      console.warn("⚠️ Login failed:", response.data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Error during login:", error.response?.data || error.message);
    return null;
  }
}
