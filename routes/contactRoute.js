import express from 'express';
import nodemailer from 'nodemailer';
import { sequelize } from '../models.js';

const router = express.Router();

// Create contact form submission endpoint
router.post('/', async (req, res) => {
    try {
        const { title, firstName, lastName, email, phone, comments } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ 
                success: false,
                message: 'Required fields are missing: firstName, lastName, email, phone' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email format' 
            });
        }

        // Phone validation (basic)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid phone format' 
            });
        }

        // Store in database (optional - you can create a Contact model if needed)
        const contactData = {
            title: title || '',
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            comments: comments || '',
            createdAt: new Date().toISOString()
        };

        // Send email
        await sendContactEmail(contactData);

        // Success response
        res.status(201).json({ 
            success: true,
            message: 'Contact form submitted successfully! We will get back to you soon.',
            data: {
                firstName: contactData.firstName,
                lastName: contactData.lastName,
                email: contactData.email,
                submittedAt: contactData.createdAt
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error. Please try again later.' 
        });
    }
});

// Email sending function
async function sendContactEmail(contactData) {
    try {
        // Debug environment variables
        console.log('🔧 Email Configuration Debug:');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
        console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
        
        // Create transporter (using Gmail)
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'muhmmadmuzamil445@gmail.com',
                pass: 'nvza ctbz iafd dapi'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test the connection first
        await transporter.verify();
        console.log('✅ Email server connection verified');

        // Email to admin (you)
        const adminEmailContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${contactData.title} ${contactData.firstName} ${contactData.lastName}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone}</p>
            <p><strong>Comments:</strong> ${contactData.comments || 'No comments provided'}</p>
            <p><strong>Submitted:</strong> ${contactData.createdAt}</p>
            <hr>
            <p><small>This message was sent from the DAMAC contact form.</small></p>
        `;

        // Auto-reply to user
        const userEmailContent = `
            <h2>Thank You for Contacting DAMAC</h2>
            <p>Dear ${contactData.title} ${contactData.firstName} ${contactData.lastName},</p>
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your submitted information:</strong></p>
            <ul>
                <li>Email: ${contactData.email}</li>
                <li>Phone: ${contactData.phone}</li>
                <li>Comments: ${contactData.comments || 'No comments provided'}</li>
            </ul>
            <p>For urgent inquiries, please call us at our helpline.</p>
            <br>
            <p>Best regards,<br>DAMAC Team</p>
            <hr>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
        `;

        // Send email to admin
        await transporter.sendMail({
            from: 'muhmmadmuzamil445@gmail.com',
            to: 'ipointsales03@gmail.com',
            subject: `New Contact Form: ${contactData.firstName} ${contactData.lastName}`,
            html: adminEmailContent
        });

        // Send auto-reply to user
        await transporter.sendMail({
            from: 'muhmmadmuzamil445@gmail.com',
            to: contactData.email,
            subject: 'Thank You for Contacting DAMAC',
            html: userEmailContent
        });

        console.log('✅ Contact emails sent successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error sending contact email:', error.message);
        console.error('❌ Full error:', error);
        // Fallback to logging if email fails
        console.log('📧 New Contact Form Submission (Email Failed - Logged Instead):');
        console.log('Name:', `${contactData.title} ${contactData.firstName} ${contactData.lastName}`);
        console.log('Email:', contactData.email);
        console.log('Phone:', contactData.phone);
        console.log('Comments:', contactData.comments || 'No comments');
        console.log('Submitted:', contactData.createdAt);
        console.log('----------------------------------------');
        return true; // Still return success so form works
    }
}

export default router;
