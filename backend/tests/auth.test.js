/**
 * ! Authentication Tests
 * Unit tests for authentication-related functions
 */
const { validatePassword } = require('../controllers/authController');

/**
 * * Password Validation Tests
 * Tests for the password validation function
 */
describe('Password Validation', () => {
  /**
   * ? Valid Password Test
   * Test that a valid password passes validation
   */
  test('validates a strong password correctly', () => {
    const validPassword = 'TestPassword123!';
    expect(validatePassword(validPassword)).toBe(true);
  });

  /**
   * ? Minimum Length Test
   * Test that short passwords are rejected
   */
  test('rejects passwords that are too short', () => {
    const shortPassword = 'Abc12!';
    expect(validatePassword(shortPassword)).toBe('Le mot de passe doit contenir au moins 8 caractères');
  });

  /**
   * ? Uppercase Requirement Test
   * Test that passwords without uppercase letters are rejected
   */
  test('rejects passwords without uppercase letters', () => {
    const noUppercasePassword = 'password123!';
    expect(validatePassword(noUppercasePassword)).toBe('Le mot de passe doit contenir au moins une majuscule');
  });

  /**
   * ? Number Requirement Test
   * Test that passwords without numbers are rejected
   */
  test('rejects passwords without numbers', () => {
    const noNumberPassword = 'Password!';
    expect(validatePassword(noNumberPassword)).toBe('Le mot de passe doit contenir au moins un chiffre');
  });

  /**
   * ? Symbol Requirement Test
   * Test that passwords without symbols are rejected
   */
  test('rejects passwords without symbols', () => {
    const noSymbolPassword = 'Password123';
    expect(validatePassword(noSymbolPassword)).toBe('Le mot de passe doit contenir au moins un symbole');
  });
}); 