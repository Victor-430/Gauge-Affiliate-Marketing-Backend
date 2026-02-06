import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

const sendVerificationEmail = async(req,res) => {
    try {
    const {email, verificationLink, userName} = req.body
    
const data = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev', email],
    subject: "Verify your email address",
   html: `<p>Hi ${userName}, <a href="${verificationLink}">verify your email</a></p>`

})

    res.status(200).json({data})
} catch (error) {
    const err = new Error("Failed to send email");
  error.status = 500;
  next(error);
 

}
}

export default sendVerificationEmail