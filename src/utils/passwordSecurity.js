const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

class PasswordSecurity {
  // Enhanced password hashing with salt rounds
  static async hashPassword(password, saltRounds = 12) {
    if (!this.isValidPassword(password)) {
      throw new Error('Password does not meet security requirements');
    }
    
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password with timing attack protection
  static async verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
      return false;
    }
    
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      // Log the error but don't expose details
      console.error('Password verification error:', error.message);
      return false;
    }
  }

  // Comprehensive password validation
  static isValidPassword(password) {
    if (!password || typeof password !== 'string') {
      return false;
    }

    const minLength = 8;
    const maxLength = 128;
    
    // Length check
    if (password.length < minLength || password.length > maxLength) {
      return false;
    }

    // Character requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    // At least 3 of 4 character types required
    const characterTypes = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const typeCount = characterTypes.filter(Boolean).length;
    
    if (typeCount < 3) {
      return false;
    }

    // Check for common patterns
    const commonPatterns = [
      /(.)\1{3,}/, // Repeated characters (4 or more)
      /1234|2345|3456|4567|5678|6789|7890/, // Sequential numbers (4 or more)
      /abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i, // Sequential letters (4 or more)
      /qwerty|asdfgh|zxcvbn/i, // Keyboard patterns
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        return false;
      }
    }

    // Check against common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'password1', '123123', 'dragon', 'master'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return false;
    }

    return true;
  }

  // Generate secure random password
  static generateSecurePassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each type
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Password strength assessment
  static assessPasswordStrength(password) {
    if (!password) {
      return { score: 0, level: 'Very Weak', feedback: [] };
    }

    let score = 0;
    const feedback = [];

    // Length scoring
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Complexity scoring
    if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
      score += 1;
    }

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeated characters');
    }

    if (/123|234|345|456|567|678|789|890/.test(password)) {
      score -= 1;
      feedback.push('Avoid sequential numbers');
    }

    // Determine strength level
    let level;
    if (score <= 2) level = 'Very Weak';
    else if (score <= 4) level = 'Weak';
    else if (score <= 6) level = 'Fair';
    else if (score <= 8) level = 'Good';
    else level = 'Strong';

    return { score, level, feedback };
  }

  // Generate secure random token
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate secure random string
  static generateSecureString(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return result;
  }

  // Hash sensitive data for logging (one-way)
  static hashForLogging(data) {
    if (!data) return 'null';
    
    const hash = crypto.createHash('sha256');
    hash.update(String(data));
    return hash.digest('hex').substring(0, 8) + '...';
  }

  // Validate password reset token
  static validatePasswordResetToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check token format (should be 64 character hex string)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return false;
    }
    
    return true;
  }

  // Generate password reset token
  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = PasswordSecurity;
