import { Container } from '../container';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register and resolve', () => {
    it('should register and resolve a service instance', () => {
      // Arrange
      const mockService = { name: 'TestService', method: jest.fn() };
      const token = 'TestService';

      // Act
      container.register(token, mockService);
      const resolved = container.resolve(token);

      // Assert
      expect(resolved).toBe(mockService);
      expect((resolved as any).name).toBe('TestService');
    });

    it('should throw error when resolving unregistered service', () => {
      // Arrange
      const token = 'UnregisteredService';

      // Act & Assert
      expect(() => container.resolve(token)).toThrow(
        'Service not registered: UnregisteredService'
      );
    });
  });

  describe('registerFactory and resolve', () => {
    it('should register factory and create instance on first resolve', () => {
      // Arrange
      const token = 'FactoryService';
      const factoryFn = jest.fn(() => ({
        name: 'FactoryCreated',
        id: Math.random(),
      }));

      // Act
      container.registerFactory(token, factoryFn);
      const resolved1 = container.resolve(token);
      const resolved2 = container.resolve(token);

      // Assert
      expect(factoryFn).toHaveBeenCalledTimes(1); // Factory should only be called once
      expect(resolved1).toBe(resolved2); // Should return the same cached instance
      expect((resolved1 as any).name).toBe('FactoryCreated');
    });
  });

  describe('has', () => {
    it('should return true for registered services', () => {
      // Arrange
      const token = 'TestService';
      container.register(token, {});

      // Act & Assert
      expect(container.has(token)).toBe(true);
    });

    it('should return true for registered factories', () => {
      // Arrange
      const token = 'FactoryService';
      container.registerFactory(token, () => ({}));

      // Act & Assert
      expect(container.has(token)).toBe(true);
    });

    it('should return false for unregistered services', () => {
      // Arrange
      const token = 'UnregisteredService';

      // Act & Assert
      expect(container.has(token)).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove registered service', () => {
      // Arrange
      const token = 'TestService';
      container.register(token, {});

      // Act
      container.remove(token);

      // Assert
      expect(container.has(token)).toBe(false);
    });

    it('should remove registered factory', () => {
      // Arrange
      const token = 'FactoryService';
      container.registerFactory(token, () => ({}));

      // Act
      container.remove(token);

      // Assert
      expect(container.has(token)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered services and factories', () => {
      // Arrange
      container.register('Service1', {});
      container.register('Service2', {});
      container.registerFactory('Factory1', () => ({}));

      // Act
      container.clear();

      // Assert
      expect(container.has('Service1')).toBe(false);
      expect(container.has('Service2')).toBe(false);
      expect(container.has('Factory1')).toBe(false);
      expect(container.getRegisteredTokens()).toEqual([]);
    });
  });

  describe('getRegisteredTokens', () => {
    it('should return all registered service tokens', () => {
      // Arrange
      container.register('Service1', {});
      container.registerFactory('Factory1', () => ({}));
      container.register('Service2', {});

      // Act
      const tokens = container.getRegisteredTokens();

      // Assert
      expect(tokens).toContain('Service1');
      expect(tokens).toContain('Service2');
      expect(tokens).toContain('Factory1');
      expect(tokens).toHaveLength(3);
    });

    it('should return empty array when no services are registered', () => {
      // Act
      const tokens = container.getRegisteredTokens();

      // Assert
      expect(tokens).toEqual([]);
    });
  });
});
