// Luhn algorithm for credit card validation
export function luhnCheck(cardNumber: string): boolean {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  // Check if the string is empty or not all digits
  if (digits.length === 0) return false;
  
  let sum = 0;
  let isEven = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Format credit card number with spaces
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
}

// Format expiry date MM/YY
export function formatExpiryDate(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (v.length >= 2) {
    return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
  }
  
  return v;
}

// Get card type from number
export function getCardType(number: string): string {
  const sanitized = number.replace(/\D/g, '');
  
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(sanitized)) {
      return type;
    }
  }
  
  return 'unknown';
}

// Generate demo card numbers for testing
export const DEMO_CARDS = {
  visa: '4242 4242 4242 4242',
  mastercard: '5555 5555 5555 4444',
  amex: '3782 822463 10005',
  discover: '6011 1111 1111 1117',
};

// Validate CVV based on card type
export function validateCVV(cvv: string, cardType: string): boolean {
  const cvvLength = cardType === 'amex' ? 4 : 3;
  return /^\d+$/.test(cvv) && cvv.length === cvvLength;
}

export function validateExpiry(expiry: string): boolean {
  const [month, year] = expiry.split('/').map(s => parseInt(s, 10))
  
  if (!month || !year || month < 1 || month > 12) {
    return false
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1

  // Check if year is too far in future (more than 20 years)
  if (year > currentYear + 20) {
    return false
  }

  // Check if expiry is in the past
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false
  }

  return true
}
