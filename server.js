const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Added for robust path handling
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 5000; 

// --- Middleware ---
// Using '*' allows all origins, which is standard for a full-stack portfolio deployed together.
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.) from the root directory
app.use(express.static(path.join(__dirname))); 

// --- 1. Homepage Route (CRITICAL FOR DEPLOYMENT) ---
// This ensures that when a user hits your main URL (e.g., shilpa.render.com),
// the server explicitly sends index.html.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 2. Email Submission Route ---
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Nodemailer Transporter Setup
   const transporter = nodemailer.createTransport({
    // Ab hum 'service: gmail' ki jagah explicit host aur port use karenge
    host: 'smtp.gmail.com',
    port: 465, // Secure SSL port
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
    // Aap optional 'timeout' bhi add kar sakte hain, although this is usually not the fix:
    // timeout: 10000 // 10 seconds timeout
});

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'upadhyayshilpa57@gmail.com', // Your target email address
        subject: `[Portfolio Inquiry] New Project Brief from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #333; padding: 20px; background-color: #f4f4f4; color: #111;">
                <h3 style="color: #FF5733;">New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Message:</strong></p>
                <div style="border-left: 3px solid #FF5733; padding-left: 15px; margin-top: 10px; background-color: #fff; padding: 10px;">${message}</div>
                <hr style="margin-top: 20px;">
                <p style="font-size: 0.9em;">(Reply directly to: ${email})</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Nodemailer Error:", error);
            // Check for common auth errors (like incorrect App Password)
            if (error.code === 'EAUTH') {
                return res.status(500).json({ success: false, message: 'Authentication failed. Please check EMAIL_USER and EMAIL_PASS environment variables.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to send message due to a server error.' });
        }
        
        console.log('Message sent successfully: %s', info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});
