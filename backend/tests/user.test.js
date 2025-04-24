/**
 * ! User Service Tests
 * Unit tests for user-related functions
 */
const userController = require('../controllers/userController');

// Mock the Prisma client
jest.mock('../config/prisma', () => ({
  user: {
    findMany: jest.fn()
  }
}));

const prisma = require('../config/prisma');

/**
 * * User Search Tests
 * Tests for the user search functionality
 */
describe('User Search', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * ? Valid Search Test
   * Test that the search function returns users correctly
   */
  test('returns users when search query is valid', async () => {
    // Mock data
    const mockUsers = [
      {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null,
        bio: 'Test user bio',
        _count: {
          collections: 5,
          favoriteBooks: 2
        }
      }
    ];

    // Mock request and response
    const req = {
      query: { q: 'test' },
      user: { id: 2 }  // Authenticated user is different from search result
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Mock the Prisma response
    prisma.user.findMany.mockResolvedValue(mockUsers);

    // Call the function
    await userController.searchUsers(req, res);

    // Assertions
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
          NOT: expect.objectContaining({
            id: 2
          })
        })
      })
    );
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  /**
   * ? Empty Query Test
   * Test that the search function requires a search term
   */
  test('returns error when search query is empty', async () => {
    // Mock request and response
    const req = {
      query: { q: '' },
      user: { id: 1 }
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Call the function
    await userController.searchUsers(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
  });

  /**
   * ? Error Handling Test
   * Test that the search function handles database errors
   */
  test('handles errors properly', async () => {
    // Mock request and response
    const req = {
      query: { q: 'test' },
      user: { id: 1 }
    };
    
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Mock a database error
    prisma.user.findMany.mockRejectedValue(new Error('Database error'));

    // Call the function
    await userController.searchUsers(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
  });
}); 