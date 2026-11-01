// MOCK email service: prints the OTP to the server console instead of sending an email.
// To send real emails later, install nodemailer and replace the body of sendOTPEmail.
exports.sendOTPEmail = async (email, otp) => {
  console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
  return true;
};
