import { luhnCheck, formatCardNumber, validateExpiry, validateCVV } from '../payment-utils'

describe('Payment Utilities', () => {
  describe('luhnCheck', () => {
    it('should validate correct card numbers', () => {
      // Test valid card numbers
      expect(luhnCheck('4242424242424242')).toBe(true) // Visa
      expect(luhnCheck('5555555555554444')).toBe(true) // Mastercard
      expect(luhnCheck('378282246310005')).toBe(true)  // Amex
    })

    it('should reject invalid card numbers', () => {
      expect(luhnCheck('4242424242424241')).toBe(false)
      expect(luhnCheck('1234567890123456')).toBe(false)
      // Note: 0000000000000000 actually passes Luhn check
    })

    it('should handle non-numeric input', () => {
      expect(luhnCheck('abcd-efgh-ijkl-mnop')).toBe(false)
      expect(luhnCheck('')).toBe(false)
      // Note: Spaces are stripped, so '4242 4242 4242 4242' is valid
      expect(luhnCheck('4242 4242 4242 4242')).toBe(true)
    })
  })

  describe('formatCardNumber', () => {
    it('should format card numbers with spaces', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
      // Amex formatting is different - groups of 4
      expect(formatCardNumber('378282246310005')).toBe('3782 8224 6310 005')
    })

    it('should handle partial card numbers', () => {
      expect(formatCardNumber('4242')).toBe('4242')
      expect(formatCardNumber('424242')).toBe('4242 42')
      expect(formatCardNumber('42424242')).toBe('4242 4242')
    })

    it('should remove non-numeric characters', () => {
      expect(formatCardNumber('4242-4242-4242-4242')).toBe('4242 4242 4242 4242')
      expect(formatCardNumber('4242 4242 4242 4242')).toBe('4242 4242 4242 4242')
    })
  })

  describe('validateExpiry', () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    it('should validate future expiry dates', () => {
      const futureMonth = currentMonth === 12 ? 1 : currentMonth + 1
      const futureYear = currentMonth === 12 ? currentYear + 1 : currentYear
      expect(validateExpiry(`${futureMonth}/${futureYear % 100}`)).toBe(true)
    })

    it('should validate current month expiry', () => {
      expect(validateExpiry(`${currentMonth}/${currentYear % 100}`)).toBe(true)
    })

    it('should reject past expiry dates', () => {
      const pastYear = currentYear - 1
      expect(validateExpiry(`${currentMonth}/${pastYear % 100}`)).toBe(false)
    })

    it('should reject invalid formats', () => {
      expect(validateExpiry('13/25')).toBe(false) // Invalid month
      expect(validateExpiry('00/25')).toBe(false) // Invalid month
      expect(validateExpiry('12/99')).toBe(false) // Too far in future
      expect(validateExpiry('abc/de')).toBe(false) // Non-numeric
    })
  })

  describe('validateCVV', () => {
    it('should validate 3-digit CVV', () => {
      expect(validateCVV('123', 'visa')).toBe(true)
      expect(validateCVV('000', 'mastercard')).toBe(true)
      expect(validateCVV('999', 'discover')).toBe(true)
    })

    it('should validate 4-digit CVV for Amex', () => {
      expect(validateCVV('1234', 'amex')).toBe(true)
      expect(validateCVV('0000', 'amex')).toBe(true)
      expect(validateCVV('9999', 'amex')).toBe(true)
    })

    it('should reject invalid CVV', () => {
      expect(validateCVV('12', 'visa')).toBe(false)     // Too short
      expect(validateCVV('12345', 'visa')).toBe(false)  // Too long
      expect(validateCVV('abc', 'visa')).toBe(false)    // Non-numeric
      expect(validateCVV('1234', 'visa')).toBe(false) // 4 digits for non-Amex
    })
  })
})