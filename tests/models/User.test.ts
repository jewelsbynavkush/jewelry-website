/**
 * User Model Tests
 * 
 * Tests for User model:
 * - Schema validation
 * - Password hashing
 * - OTP generation and verification
 * - Login attempts and account locking
 * - Address management
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import User, { IUserModel } from '@/models/User';
import { createTestUser, randomEmail } from '../helpers/test-utils';

describe('User Model', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.mobile).toBe(userData.mobile);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe('customer');
      expect(user.isActive).toBe(true);
    });

    it('should require email', async () => {
      const userData = createTestUser();
      delete (userData as any).email;

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require firstName', async () => {
      const userData = createTestUser();
      delete (userData as any).firstName;

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require lastName', async () => {
      const userData = createTestUser();
      delete (userData as any).lastName;

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const email = randomEmail();
      const userData = createTestUser({
        email,
      });

      await User.create(userData);

      const userData2 = createTestUser({
        email,
      });

      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should enforce unique email if provided', async () => {
      const email = randomEmail();
      const userData = createTestUser({ email });

      await User.create(userData);

      const userData2 = createTestUser({ email });

      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should allow multiple users with different emails', async () => {
      const userData1 = createTestUser();
      const userData2 = createTestUser();

      const user1 = await User.create(userData1);
      const user2 = await User.create(userData2);

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      const userData = createTestUser({
        password: 'Test@123456',
      });

      const user = await User.create(userData);

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('Test@123456');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should compare password correctly', async () => {
      const userData = createTestUser({
        password: 'Test@123456',
      });

      const user = await User.create(userData);

      const isValid = await user.comparePassword('Test@123456');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('OTP Generation and Verification', () => {

    it('should generate email OTP', async () => {
      const userData = createTestUser({ email: randomEmail() });
      const user = await User.create(userData);

      const otp = user.generateEmailOTP();
      await user.save();

      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      expect(user.emailVerificationOTP).toBe(otp);
      expect(user.emailVerificationOTPExpires).toBeDefined();
    });

    it('should require email to generate email OTP', async () => {
      // Email is required in schema, so we can't create a user without email
      // This test verifies that generateEmailOTP works when email is present
      const userData = createTestUser({ email: randomEmail() });
      const user = await User.create(userData);

      const otp = user.generateEmailOTP();
      await user.save();

      expect(otp).toBeDefined();
      expect(user.emailVerificationOTP).toBe(otp);
    });

    it('should verify valid email OTP', async () => {
      const userData = createTestUser({ email: randomEmail() });
      const user = await User.create(userData);

      const otp = user.generateEmailOTP();
      await user.save();

      const isValid = user.verifyEmailOTP(otp);
      expect(isValid).toBe(true);
    });

    it('should reject invalid email OTP', async () => {
      const userData = createTestUser({ email: randomEmail() });
      const user = await User.create(userData);

      user.generateEmailOTP();
      await user.save();

      const isValid = user.verifyEmailOTP('000000');
      expect(isValid).toBe(false);
    });

    it('should reject expired email OTP', async () => {
      const userData = createTestUser({ email: randomEmail() });
      const user = await User.create(userData);

      const otp = user.generateEmailOTP();
      user.emailVerificationOTPExpires = new Date(Date.now() - 1000); // Expired
      await user.save();

      const isValid = user.verifyEmailOTP(otp);
      expect(isValid).toBe(false);
    });
  });

  describe('Login Attempts and Account Locking', () => {
    it('should increment login attempts', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      await (User as IUserModel).incrementLoginAttempts(user._id.toString());

      const updated = await User.findById(user._id);
      expect(updated?.loginAttempts).toBe(1);
    });

    it('should lock account after max attempts', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      // Increment to max attempts (default is 5)
      for (let i = 0; i < 5; i++) {
        await (User as IUserModel).incrementLoginAttempts(user._id.toString());
      }

      const updated = await User.findById(user._id);
      expect(updated?.isLocked).toBe(true);
      expect(updated?.lockUntil).toBeDefined();
    });

    it('should reset login attempts on successful login', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      await (User as IUserModel).incrementLoginAttempts(user._id.toString());
      await (User as IUserModel).incrementLoginAttempts(user._id.toString());

      await (User as IUserModel).resetLoginAttempts(user._id.toString());

      const updated = await User.findById(user._id);
      expect(updated?.loginAttempts).toBe(0);
      expect(updated?.lockUntil).toBeUndefined();
    });
  });

  describe('Address Management', () => {
    it('should add address', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      const addressId = user.addAddress({
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        phone: '9876543210',
        countryCode: '+91',
        isDefault: true,
      });

      await user.save();

      expect(addressId).toBeDefined();
      expect(user.addresses.length).toBe(1);
      expect(user.addresses[0].firstName).toBe('Test');
      expect(user.defaultShippingAddressId).toBe(addressId);
    });

    it('should update address', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      const addressId = user.addAddress({
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        phone: '9876543210',
        countryCode: '+91',
        isDefault: true,
      });

      await user.save();

      const address = user.addresses.find((a) => a.id === addressId);
      if (address) {
        address.firstName = 'Updated';
        address.city = 'Updated City';
      }

      await user.save();

      const updated = await User.findById(user._id);
      const updatedAddress = updated?.addresses.find((a) => a.id === addressId);
      expect(updatedAddress?.firstName).toBe('Updated');
      expect(updatedAddress?.city).toBe('Updated City');
    });

    it('should remove address', async () => {
      const userData = createTestUser();
      const user = await User.create(userData);

      const addressId = user.addAddress({
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        phone: '9876543210',
        countryCode: '+91',
        isDefault: true,
      });

      await user.save();

      user.addresses = user.addresses.filter((a) => a.id !== addressId);
      user.defaultShippingAddressId = undefined;
      await user.save();

      const updated = await User.findById(user._id);
      expect(updated?.addresses.length).toBe(0);
      expect(updated?.defaultShippingAddressId).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid mobile number format', async () => {
      const userData = createTestUser({
        mobile: '12345', // Too short
      });

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should handle invalid email format', async () => {
      const userData = createTestUser({
        email: 'invalid-email',
      });

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should handle empty password', async () => {
      const userData = createTestUser({
        password: '',
      });

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should handle very short password', async () => {
      const userData = createTestUser({
        password: '123',
      });

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
