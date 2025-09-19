const nodemailer = require('nodemailer');
const { AppError } = require('../errors');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      } else {
        // Use Ethereal for development
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      this.isInitialized = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  getTransporter() {
    if (!this.isInitialized || !this.transporter) {
      throw new AppError('Email service not initialized', 500);
    }
    return this.transporter;
  }

  // Send email with template
  async sendEmail(emailData) {
    try {
      const transporter = this.getTransporter();
      
      const {
        to,
        subject,
        text,
        html,
        from = process.env.FROM_EMAIL || 'noreply@ecommerce.com',
        attachments = [],
        replyTo = null
      } = emailData;

      const mailOptions = {
        from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
        attachments,
        replyTo
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent successfully to ${to}:`, result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const emailData = {
      to: user.email,
      subject: 'Welcome to Ecommerce API!',
      text: `Welcome ${user.name}! Your account has been created successfully.`,
      html: this.getWelcomeEmailTemplate(user)
    };

    return this.sendEmail(emailData);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const emailData = {
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetUrl}`,
      html: this.getPasswordResetEmailTemplate(user, resetUrl)
    };

    return this.sendEmail(emailData);
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(user, order) {
    const emailData = {
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      text: `Your order ${order.orderNumber} has been confirmed.`,
      html: this.getOrderConfirmationEmailTemplate(user, order)
    };

    return this.sendEmail(emailData);
  }

  // Send shipment notification email
  async sendShipmentNotificationEmail(user, shipment) {
    const emailData = {
      to: user.email,
      subject: `Shipment Update - ${shipment.trackingNumber}`,
      text: `Your shipment ${shipment.trackingNumber} status has been updated to ${shipment.status}.`,
      html: this.getShipmentNotificationEmailTemplate(user, shipment)
    };

    return this.sendEmail(emailData);
  }

  // Send admin notification email
  async sendAdminNotificationEmail(adminEmails, subject, message, data = {}) {
    const emailData = {
      to: adminEmails,
      subject: `Admin Notification: ${subject}`,
      text: message,
      html: this.getAdminNotificationEmailTemplate(subject, message, data)
    };

    return this.sendEmail(emailData);
  }

  // Email templates
  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Ecommerce API!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Your account has been created successfully with the role: <strong>${user.role}</strong></p>
            <p>You can now start using our logistics management system.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Ecommerce API Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request this, please ignore this email.</p>
            <p><strong>Note:</strong> This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Ecommerce API Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOrderConfirmationEmailTemplate(user, order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Your order has been confirmed successfully.</p>
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Delivery City:</strong> ${order.deliveryCity}</p>
              <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
            </div>
            <p>We'll keep you updated on your order status.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Ecommerce API Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getShipmentNotificationEmailTemplate(user, shipment) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Shipment Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .shipment-details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .status { padding: 8px 16px; border-radius: 4px; color: white; font-weight: bold; }
          .status.preparing { background: #ffc107; }
          .status.in-transit { background: #17a2b8; }
          .status.delivered { background: #28a745; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shipment Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Your shipment status has been updated.</p>
            <div class="shipment-details">
              <h3>Shipment Details:</h3>
              <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
              <p><strong>Status:</strong> <span class="status ${shipment.status.toLowerCase().replace('_', '-')}">${shipment.status}</span></p>
              <p><strong>Current Location:</strong> ${shipment.currentLocation || 'N/A'}</p>
              <p><strong>Estimated Delivery:</strong> ${shipment.estimatedDeliveryDate || 'N/A'}</p>
            </div>
            <p>Track your shipment using the tracking number above.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Ecommerce API Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdminNotificationEmailTemplate(subject, message, data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6c757d; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .data { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admin Notification</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
            ${Object.keys(data).length > 0 ? `
              <div class="data">
                <h3>Additional Data:</h3>
                <pre>${JSON.stringify(data, null, 2)}</pre>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Ecommerce API System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { status: 'not_initialized', message: 'Email service not initialized' };
      }

      const transporter = this.getTransporter();
      await transporter.verify();
      
      return {
        status: 'healthy',
        message: 'Email service is working properly',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new EmailService();
