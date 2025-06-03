import PhoneNumberConfig, {
  IPhoneNumberConfig,
} from "../models/PhoneNumberConfig";
import phoneNumberConfigService from "../services/phoneNumberConfigService";

// Mock model
jest.mock("../models/PhoneNumberConfig");

describe("PhoneNumberConfigService", () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPhoneNumberConfigs", () => {
    it("should return all phone number configurations", async () => {
      // Arrange
      const mockConfigs = [
        {
          country: "Việt Nam",
          countryCode: "+84",
          regex: "^(0|\\+84)[0-9]{9}$",
        },
        { country: "USA", countryCode: "+1", regex: "^(\\+1)[0-9]{10}$" },
      ];
      (PhoneNumberConfig.find as jest.Mock).mockResolvedValue(mockConfigs);

      // Act
      const result = await phoneNumberConfigService.getAllPhoneNumberConfigs();

      // Assert
      expect(PhoneNumberConfig.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockConfigs);
      expect(result.length).toBe(2);
    });

    it("should throw error when there is a problem getting configs", async () => {
      // Arrange
      const mockError = new Error("Database error");
      (PhoneNumberConfig.find as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        phoneNumberConfigService.getAllPhoneNumberConfigs(),
      ).rejects.toThrow("Database error");
      expect(PhoneNumberConfig.find).toHaveBeenCalledWith({});
    });
  });

  describe("getPhoneNumberConfig", () => {
    it("should return the phone number configuration for a specific country", async () => {
      // Arrange
      const mockConfig = {
        country: "Việt Nam",
        countryCode: "+84",
        regex: "^(0|\\+84)[0-9]{9}$",
      };
      (PhoneNumberConfig.findOne as jest.Mock).mockResolvedValue(mockConfig);

      // Act
      const result =
        await phoneNumberConfigService.getPhoneNumberConfig("Việt Nam");

      // Assert
      expect(PhoneNumberConfig.findOne).toHaveBeenCalledWith({
        country: { $regex: expect.any(RegExp) },
      });
      expect(result).toEqual(mockConfig);
    });

    it("should throw error when country is not provided", async () => {
      // Act & Assert
      await expect(
        phoneNumberConfigService.getPhoneNumberConfig(""),
      ).rejects.toThrow("Country is required");
      expect(PhoneNumberConfig.findOne).not.toHaveBeenCalled();
    });

    it("should throw error when configuration not found", async () => {
      // Arrange
      (PhoneNumberConfig.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        phoneNumberConfigService.getPhoneNumberConfig("Unknown"),
      ).rejects.toThrow("No phone number configuration found for Unknown");
      expect(PhoneNumberConfig.findOne).toHaveBeenCalled();
    });
  });

  describe("addPhoneNumberConfig", () => {
    it("should add a new phone number configuration", async () => {
      // Arrange
      const newConfig = {
        country: "Germany",
        countryCode: "+49",
        regex: "^(\\+49)[0-9]{10}$",
      };
      const savedConfig = {
        ...newConfig,
        _id: "some-id",
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock constructor
      (PhoneNumberConfig as unknown as jest.Mock).mockImplementation(
        () => savedConfig,
      );
      // Mock findOne to return null (no existing config)
      (PhoneNumberConfig.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result =
        await phoneNumberConfigService.addPhoneNumberConfig(newConfig);

      // Assert
      expect(PhoneNumberConfig.findOne).toHaveBeenCalledWith({
        country: newConfig.country,
      });
      expect(PhoneNumberConfig).toHaveBeenCalledWith(newConfig);
      expect(savedConfig.save).toHaveBeenCalled();
      expect(result).toEqual(savedConfig);
    });

    it("should throw error when country is not provided", async () => {
      // Arrange
      const invalidConfig = { countryCode: "+49", regex: "^(\\+49)[0-9]{10}$" };

      // Act & Assert
      await expect(
        phoneNumberConfigService.addPhoneNumberConfig(invalidConfig as any),
      ).rejects.toThrow("Country is required");
      expect(PhoneNumberConfig.findOne).not.toHaveBeenCalled();
    });

    it("should throw error when country code is not provided", async () => {
      // Arrange
      const invalidConfig = { country: "Germany", regex: "^(\\+49)[0-9]{10}$" };

      // Act & Assert
      await expect(
        phoneNumberConfigService.addPhoneNumberConfig(invalidConfig as any),
      ).rejects.toThrow("Country code is required");
      expect(PhoneNumberConfig.findOne).not.toHaveBeenCalled();
    });

    it("should throw error when regex is not provided", async () => {
      // Arrange
      const invalidConfig = { country: "Germany", countryCode: "+49" };

      // Act & Assert
      await expect(
        phoneNumberConfigService.addPhoneNumberConfig(invalidConfig as any),
      ).rejects.toThrow("Regex is required");
      expect(PhoneNumberConfig.findOne).not.toHaveBeenCalled();
    });

    it("should throw error when regex is invalid", async () => {
      // Arrange
      const invalidConfig = {
        country: "Germany",
        countryCode: "+49",
        regex: "(", // Invalid regex
      };

      // Act & Assert
      await expect(
        phoneNumberConfigService.addPhoneNumberConfig(invalidConfig),
      ).rejects.toThrow("Invalid regex pattern");
      expect(PhoneNumberConfig.findOne).not.toHaveBeenCalled();
    });

    it("should throw error when country already exists", async () => {
      // Arrange
      const existingConfig = {
        country: "Germany",
        countryCode: "+49",
        regex: "^(\\+49)[0-9]{10}$",
      };

      // Mock findOne to return an existing config
      (PhoneNumberConfig.findOne as jest.Mock).mockResolvedValue(
        existingConfig,
      );

      // Act & Assert
      await expect(
        phoneNumberConfigService.addPhoneNumberConfig(existingConfig),
      ).rejects.toThrow(
        "Phone number configuration for Germany already exists",
      );
      expect(PhoneNumberConfig.findOne).toHaveBeenCalledWith({
        country: existingConfig.country,
      });
      expect(PhoneNumberConfig).not.toHaveBeenCalled();
    });
  });

  describe("updatePhoneNumberConfig", () => {
    it("should update an existing phone number configuration", async () => {
      // Arrange
      const country = "Việt Nam";
      const updateData = { countryCode: "+84", regex: "^(0|\\+84)[0-9]{10}$" };
      const updatedConfig = {
        country,
        ...updateData,
      };

      (PhoneNumberConfig.findOneAndUpdate as jest.Mock).mockResolvedValue(
        updatedConfig,
      );

      // Act
      const result = await phoneNumberConfigService.updatePhoneNumberConfig(
        country,
        updateData,
      );

      // Assert
      expect(PhoneNumberConfig.findOneAndUpdate).toHaveBeenCalledWith(
        { country },
        updateData,
        { new: true },
      );
      expect(result).toEqual(updatedConfig);
    });

    it("should throw error when regex is invalid", async () => {
      // Arrange
      const country = "Việt Nam";
      const updateData = { regex: "(" }; // Invalid regex

      // Act & Assert
      await expect(
        phoneNumberConfigService.updatePhoneNumberConfig(country, updateData),
      ).rejects.toThrow("Invalid regex pattern");
      expect(PhoneNumberConfig.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw error when configuration not found", async () => {
      // Arrange
      const country = "Unknown";
      const updateData = { countryCode: "+999" };

      (PhoneNumberConfig.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        phoneNumberConfigService.updatePhoneNumberConfig(country, updateData),
      ).rejects.toThrow("No phone number configuration found for Unknown");
      expect(PhoneNumberConfig.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe("deletePhoneNumberConfig", () => {
    it("should delete a phone number configuration", async () => {
      // Arrange
      const country = "Việt Nam";
      const deletedConfig = {
        country,
        countryCode: "+84",
        regex: "^(0|\\+84)[0-9]{9}$",
      };

      (PhoneNumberConfig.findOneAndDelete as jest.Mock).mockResolvedValue(
        deletedConfig,
      );

      // Act
      const result =
        await phoneNumberConfigService.deletePhoneNumberConfig(country);

      // Assert
      expect(PhoneNumberConfig.findOneAndDelete).toHaveBeenCalledWith({
        country,
      });
      expect(result).toEqual(deletedConfig);
    });

    it("should throw error when configuration not found", async () => {
      // Arrange
      const country = "Unknown";

      (PhoneNumberConfig.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        phoneNumberConfigService.deletePhoneNumberConfig(country),
      ).rejects.toThrow("No phone number configuration found for Unknown");
      expect(PhoneNumberConfig.findOneAndDelete).toHaveBeenCalledWith({
        country,
      });
    });
  });
});
