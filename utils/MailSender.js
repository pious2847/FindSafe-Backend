const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const PasswordReset = require("../models/utils_models/PasswordReset.js");
const Users = require("../models/users.js");


const transporter =  nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.AUTH_EMAIL, 
    pass: process.env.AUTH_PASS }
});


const sendResetEmail = async (email, user,  _req, res) => {
  if (!user) {
    return res.status(400).send('Account not found');
  }

  const verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
 await transporter.verify((error, success)=>{
   if (error) {
    console.log('===============================================', error);
   }else{
    console.log( success);
   }
  })

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Password Verification Code',
    html : `
      <div style="background-color: #f0f0f0; padding: 20px;">
        <h2 style="color: #333; font-size: 24px;">Password Verification Code</h2>
        <p style="color: #555; font-size: 16px;">Enter the verification code below to verify your email and initiate a password reset.</p>
        <p style="color: #555; font-size: 16px;"><b>Verification Code:</b> <span style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 5px;">${verificationCode}</span></p>
        <p style="color: #555; font-size: 16px;">This code expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await PasswordReset.deleteMany({ userId: user._id });
    const salt = 10;
    const hashedVerificationCode = await bcrypt.hash(verificationCode, salt);

    const newPasswordReset = new PasswordReset({
      userId: user._id,
      verificationCode: hashedVerificationCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600,
    });

    await newPasswordReset.save();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent Sucessfully" + info.response);
      }
    });

  } catch (error) {
    console.log(error);
    throw error;
  }
};


const resetPassword = async (verificationCode, userId, req, res) => {
  try {
    const passwordReset = await PasswordReset.findOne({ userId: userId });

    if (!passwordReset) {
      req.flash("alertMessage", "Invalid verification code");
      req.flash("alertStatus", "danger");
      return res.redirect("/verify_code");
    }
    console.log(passwordReset);
    const validPassword = await bcrypt.compare(
      verificationCode,
      passwordReset.verificationCode
    );

    if (!validPassword) {
      req.flash("alertMessage", "Invalid verification code");
      req.flash("alertStatus", "danger");
      return res.redirect("/verify_code");
    }

    // Use the deleteOne method to remove the document
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    req.flash("alertMessage", "Email Verification Complete");
    req.flash("alertStatus", "success");
    return res.redirect("/new_password");
  } catch (error) {
    console.error(error);
    req.flash("alertMessage", "An error occurred.");
    req.flash("alertStatus", "danger");
    return res.redirect("/verify_code");
  }
};

const updateUserPassword = async (userId, newPassword, req, res) => {
  try {
    let user;

    // Check both the Userss and Managers collections for the user with the given ID
    user = await Users.findById(userId); // Check the Userss collection

    if (!user) {
      req.flash("alertMessage", "Password Reset Fail User Not Found");
      req.flash("alertStatus", "danger");
      return res.redirect("/new_password");
    }

    // Update the user's password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    return user; // Optionally, you can return the updated user for further use
  } catch (error) {
    throw error;
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      req.flash("alertMessage", "User not logged in");
      req.flash("alertStatus", "danger");
      return res.redirect("/login");
    }

    try {
      let user = await Users.findById(userId);

      if (!user) {
        req.flash("alertMessage", "User not found");
        req.flash("alertStatus", "danger");
        return res.redirect("/login");
      }

      return res.render("profile", { user });
    } catch (error) {
      console.error("An error occurred:", error.message);
      req.flash("alertMessage", "An error occurred. Please try again.");
      req.flash("alertStatus", "danger");
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const sendEmail = async (name, reciepient, subject, message) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: reciepient,
    subject: subject,
    html: `
    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; font-family: 'Arial', sans-serif; color: #333;">
    <h2 style="color: #007BFF; font-size: 20px; margin-bottom: 15px;">Hello ${name},</h2><br>
    ${message}
    </div>

    `,
  };

  try {
    // Any additional processing, e.g., hashing data
    const hashedSubject = await bcrypt.hash(subject, 10);

    // Sending email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error)
    throw error;
  }
};

module.exports =  {
  sendResetEmail,
  resetPassword,
  updateUserPassword,
  getUserProfile,
  sendEmail,
};
