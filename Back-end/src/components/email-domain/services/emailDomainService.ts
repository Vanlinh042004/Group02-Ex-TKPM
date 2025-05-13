import EmailDomain, { IEmailDomain } from '../models/EmailDomain'

class EmailDomainService {
    /**
     * Thêm domain email được phép đăng ký
     * @param domain domain cần thêm
     * @returns Promise<IEmailDomain> Domain đã thêm
     */
    async addAllowedEmailDomain(domain: string): Promise<IEmailDomain> {
        const newDomain = new EmailDomain({ domain })
        return await newDomain.save()
    }
    /**
     * Xóa domain email đã được đăng ký
     * @param domain domain cần xóa
     * @returns Promise<IEmailDomain> Domain đã xóa
     */
    async deleteAllowedEmailDomain(domain: string): Promise<IEmailDomain> {
        const result = await EmailDomain.findOneAndDelete({ domain })
        if (!result) {
            throw new Error('Domain not found')
        }
        return result
    }
    /**
     * Update domain email đã được đăng ký
     * @param domain 
     * @param newDomain 
     * @returns Promise<IEmailDomain> Domain đã update
     */
    async updateAllowedEmailDomain(domain: string, newDomain: string): Promise<IEmailDomain> {
        const updatedDomain = await EmailDomain.findOneAndUpdate(
            { domain },
            { domain: newDomain },
            { new: true }
        )
        if (!updatedDomain) {
            throw new Error('Domain not found')
        }
        return updatedDomain
    }
    /**
     * Lấy danh sách các email domain được phép đăng ký
     * @returns {Promise<IEmailDomain[]>} Danh sách các domain
     */
    async getAllAllowedEmailDomains(): Promise<IEmailDomain[]> {
        return await EmailDomain.find()
    }

    /**
     * Kiểm tra email có thuộc domain được phép không
     * @param email email cần kiểm tra (đã được chuẩn hóa từ phía FE)
     * @returns 
     */
    async isValidEmailDomain(email: string): Promise<boolean> {
        const emailDomain = this.parseDomain(email)
        const allowedEmailDomains = await this.getAllAllowedEmailDomains()

        return allowedEmailDomains.some(domain => emailDomain === domain.domain)
    }

    /**
     * Parse domain từ email
     * @param email cần parse domain
     * @returns 
     */
    private parseDomain(email: string): string {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/

        const match = email.match(emailRegex)
        if (!match) {
            throw new Error('Invalid email format');
        }

        return match[1]
    }
}

export default new EmailDomainService()
