import EmailDomain from "../models/EmailDomain";
import EmailDomainService from "../services/emailDomainService";

jest.mock("../models/EmailDomain");

describe("EmailDomainService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addAllowedEmailDomain", () => {
    it("should add a new email domain", async () => {
      const mockDomain = {
        domain: "example.com",
        _id: "mock-id",
        save: jest.fn().mockResolvedValue({
          domain: "example.com",
          _id: "mock-id",
        }),
      };

      (EmailDomain as unknown as jest.Mock).mockImplementation(
        () => mockDomain,
      );

      const result =
        await EmailDomainService.addAllowedEmailDomain("example.com");

      expect(EmailDomain).toHaveBeenCalledWith({ domain: "example.com" });
      expect(mockDomain.save).toHaveBeenCalled();
      expect(result).toEqual({
        domain: "example.com",
        _id: "mock-id",
      });
    });

    it("should throw error if save fails", async () => {
      const mockDomain = {
        domain: "example.com",
        _id: "mock-id",
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };
      (EmailDomain as unknown as jest.Mock).mockImplementation(
        () => mockDomain,
      );

      await expect(
        EmailDomainService.addAllowedEmailDomain("example.com"),
      ).rejects.toThrow("Save failed");
    });
  });

  describe("deleteAllowedEmailDomain", () => {
    it("should delete an email domain", async () => {
      const mockDeletedDomain = {
        domain: "example.com",
        _id: "mock-id",
      };

      (EmailDomain.findOneAndDelete as jest.Mock).mockResolvedValue(
        mockDeletedDomain,
      );

      const result =
        await EmailDomainService.deleteAllowedEmailDomain("example.com");

      expect(EmailDomain.findOneAndDelete).toHaveBeenCalledWith({
        domain: "example.com",
      });
      expect(result).toEqual(mockDeletedDomain);
    });

    it("should throw an error if domain not found", async () => {
      (EmailDomain.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(
        EmailDomainService.deleteAllowedEmailDomain("example.com"),
      ).rejects.toThrow("Domain not found");

      expect(EmailDomain.findOneAndDelete).toHaveBeenCalledWith({
        domain: "example.com",
      });
    });

    it("should throw error if findOneAndDelete fails", async () => {
      (EmailDomain.findOneAndDelete as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        EmailDomainService.deleteAllowedEmailDomain("example.com"),
      ).rejects.toThrow("DB error");
    });
  });

  describe("updateAllowedEmailDomain", () => {
    it("should update an email domain", async () => {
      const mockUpdatedDomain = {
        domain: "new-example.com",
        _id: "mock-id",
      };

      (EmailDomain.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedDomain,
      );

      const result = await EmailDomainService.updateAllowedEmailDomain(
        "example.com",
        "new-example.com",
      );

      expect(EmailDomain.findOneAndUpdate).toHaveBeenCalledWith(
        { domain: "example.com" },
        { domain: "new-example.com" },
        { new: true },
      );
      expect(result).toEqual(mockUpdatedDomain);
    });

    it("should throw an error if domain not found", async () => {
      (EmailDomain.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        EmailDomainService.updateAllowedEmailDomain(
          "example.com",
          "new-example.com",
        ),
      ).rejects.toThrow("Domain not found");

      expect(EmailDomain.findOneAndUpdate).toHaveBeenCalledWith(
        { domain: "example.com" },
        { domain: "new-example.com" },
        { new: true },
      );
    });

    it("should throw error if findOneAndUpdate fails", async () => {
      (EmailDomain.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        EmailDomainService.updateAllowedEmailDomain(
          "example.com",
          "new-example.com",
        ),
      ).rejects.toThrow("DB error");
    });
  });

  describe("getAllAllowedEmailDomains", () => {
    it("should return all email domains", async () => {
      const mockDomains = [
        { domain: "example.com", _id: "id-1" },
        { domain: "test.edu", _id: "id-2" },
      ];

      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);

      const result = await EmailDomainService.getAllAllowedEmailDomains();

      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toEqual(mockDomains);
    });

    it("should throw error if find fails", async () => {
      (EmailDomain.find as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        EmailDomainService.getAllAllowedEmailDomains(),
      ).rejects.toThrow("DB error");
    });
  });

  describe("isValidEmailDomain", () => {
    it("should return true for valid email domain", async () => {
      const mockDomains = [
        { domain: "example.com", _id: "id-1" },
        { domain: "test.edu", _id: "id-2" },
      ];

      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);

      const result =
        await EmailDomainService.isValidEmailDomain("user@example.com");

      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false for invalid email domain", async () => {
      const mockDomains = [
        { domain: "example.com", _id: "id-1" },
        { domain: "test.edu", _id: "id-2" },
      ];

      (EmailDomain.find as jest.Mock).mockResolvedValue(mockDomains);

      const result =
        await EmailDomainService.isValidEmailDomain("user@invalid.com");

      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should throw an error for invalid email format", async () => {
      await expect(
        EmailDomainService.isValidEmailDomain("invalid-email"),
      ).rejects.toThrow("Invalid email format");
    });

    it("should throw error if find fails", async () => {
      (EmailDomain.find as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        EmailDomainService.isValidEmailDomain("user@example.com"),
      ).rejects.toThrow("DB error");
    });
  });

  describe("parseDomain", () => {
    it("should parse domain from email correctly", async () => {
      // Đảm bảo hàm parseDomain hoạt động đúng qua isValidEmailDomain
      (EmailDomain.find as jest.Mock).mockResolvedValue([]);
      const result =
        await EmailDomainService.isValidEmailDomain("user@example.com");
      expect(EmailDomain.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should throw error for email without @", async () => {
      await expect(
        EmailDomainService.isValidEmailDomain("userexample.com"),
      ).rejects.toThrow("Invalid email format");
    });
  });
});
