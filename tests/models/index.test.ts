/**
 * Models barrel (index) - ensures all exports are available from @/models
 */

import { describe, it, expect } from 'vitest';
import * as Models from '@/models';

describe('models/index', () => {
  it('exports Product model and types', () => {
    expect(Models.Product).toBeDefined();
    expect(typeof Models.Product).toBe('function');
  });

  it('exports User model and types', () => {
    expect(Models.User).toBeDefined();
    expect(typeof Models.User).toBe('function');
  });

  it('exports InventoryLog model', () => {
    expect(Models.InventoryLog).toBeDefined();
    expect(typeof Models.InventoryLog).toBe('function');
  });

  it('exports Category model', () => {
    expect(Models.Category).toBeDefined();
    expect(typeof Models.Category).toBe('function');
  });

  it('exports SiteSettings model', () => {
    expect(Models.SiteSettings).toBeDefined();
    expect(typeof Models.SiteSettings).toBe('function');
  });

  it('exports Cart model', () => {
    expect(Models.Cart).toBeDefined();
    expect(typeof Models.Cart).toBe('function');
  });

  it('exports Order model', () => {
    expect(Models.Order).toBeDefined();
    expect(typeof Models.Order).toBe('function');
  });

  it('exports RefreshToken model', () => {
    expect(Models.RefreshToken).toBeDefined();
    expect(typeof Models.RefreshToken).toBe('function');
  });

  it('exports ContactSubmission model', () => {
    expect(Models.ContactSubmission).toBeDefined();
    expect(typeof Models.ContactSubmission).toBe('function');
  });

  it('exports CountrySettings model', () => {
    expect(Models.CountrySettings).toBeDefined();
    expect(typeof Models.CountrySettings).toBe('function');
  });
});
