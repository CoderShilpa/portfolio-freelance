const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sgMail = require('@sendgrid/mail'); // <-- Naya package import
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- SendGrid Setup (Initialization) ---
// API key ko yahan initialize karein
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- Middleware and Static Files ---
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); 

// --- 1. Homepage Route ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 2. Email Submission Route (HTTP API FIX) ---
app.post('/send-email', async (req, res) => { // <-- Function MUST be async now
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const msg = {
        to: 'upadhyayshilpa57@gmail.com', // Recipient
        from: 'upadhyayshilpa57@gmail.com', // Must be your verified Sender Email in SendGrid
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
        `,
    };

    try {
        await sgMail.send(msg); // <-- SendGrid API call (uses HTTP)
        console.log('Message sent successfully via SendGrid HTTP API');
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        // SendGrid API error handling
        console.error("SendGrid API Error:", error.response ? error.response.body : error);
        
        // This usually means the API key is wrong or the 'from' email is unverified.
        if (error.code === 401 || error.code === 403) { 
            return res.status(500).json({ success: false, message: 'Authentication failed. Please check your SENDGRID_API_KEY.' });
        }
        
        return res.status(500).json({ success: false, message: 'Failed to send message due to a server error.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
