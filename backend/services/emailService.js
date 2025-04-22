const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vérification de votre compte MyBook',
    html: `
      <h1>Bienvenue sur MyBook !</h1>
      <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
      <a href="${verificationUrl}">Vérifier mon compte</a>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `
  };

  try {
    console.log('Tentative d\'envoi d\'email à:', email);
    console.log('URL de vérification:', verificationUrl);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}; 