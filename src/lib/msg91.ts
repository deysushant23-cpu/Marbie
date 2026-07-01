import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export async function sendOTP(mobile: string) {
  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    console.warn("MSG91 keys are missing. Simulating OTP for development.");
    return { type: 'success', message: 'Simulated OTP sent.' };
  }

  // Remove any '+' or spaces from mobile number
  let cleanMobile = mobile.replace(/[\+\s\-]/g, '');
  if (cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile; // Default to India country code
  }
  
  const url = `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${cleanMobile}&authkey=${MSG91_AUTH_KEY}`;
  
  try {
    const res = await axios.post(url);
    console.log("MSG91 Send OTP Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("MSG91 Send OTP Error:", error);
    throw new Error("Failed to send OTP");
  }
}

export async function verifyOTP(mobile: string, otp: string) {
  if (!MSG91_AUTH_KEY) {
    console.warn("MSG91 auth key missing. Simulating OTP verification.");
    if (otp === "123456") return { type: 'success' };
    return { type: 'error', message: 'Invalid simulated OTP' };
  }

  let cleanMobile = mobile.replace(/[\+\s\-]/g, '');
  if (cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile; // Default to India country code
  }
  const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${cleanMobile}&authkey=${MSG91_AUTH_KEY}`;
  
  try {
    const res = await axios.get(url);
    console.log("MSG91 Verify OTP Response:", res.data);
    return res.data; 
  } catch (error) {
    console.error("MSG91 Verify OTP Error:", error);
    throw new Error("Failed to verify OTP");
  }
}
