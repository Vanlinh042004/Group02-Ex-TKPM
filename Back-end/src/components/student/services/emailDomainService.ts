import EmailDomain, { IEmailDomain } from '../models/EmailDomain'

class EmailDomainService {
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
