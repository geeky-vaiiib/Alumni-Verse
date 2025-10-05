/**
 * Email Parsing Utility
 * Extracts USN, branch, and passing year from SIT institutional emails
 * 
 * Email format: 1si23is117@sit.ac.in
 * Pattern: [entry_digit][si][batch_year][branch_code][roll_number]@sit.ac.in
 * 
 * Example: 1si23is117@sit.ac.in
 *   - USN: 1SI23IS117 (uppercased local part)
 *   - Branch: IS (Information Science)
 *   - Passing Year: 2027 (batch 23 + 4 years)
 */

const BRANCH_MAP = {
  'CS': 'Computer Science',
  'IS': 'Information Science',
  'EC': 'Electronics and Communication',
  'EE': 'Electrical and Electronics',
  'ME': 'Mechanical Engineering',
  'CV': 'Civil Engineering',
  'CH': 'Chemical Engineering',
  'BT': 'Biotechnology',
  'IM': 'Industrial Engineering and Management',
  'AI': 'Artificial Intelligence',
  'ML': 'Machine Learning',
  'DS': 'Data Science',
  'CY': 'Cyber Security',
  'TC': 'Telecommunication',
  'AE': 'Aeronautical Engineering',
  'AU': 'Automobile Engineering',
  'EI': 'Electronics and Instrumentation',
};

/**
 * Parse SIT email address to extract student information
 * @param {string} email - Institutional email (e.g., 1si23is117@sit.ac.in)
 * @returns {Object} Parsed data with usn, branch, passingYear
 */
export const parseEmailToUSNBranchYear = (email) => {
  try {
    // Extract local part before @
    const localPart = email.split('@')[0].toUpperCase();
    
    // USN is the entire local part uppercased
    const usn = localPart;
    
    // Extract branch code - typically 2-3 characters after 'SI' and year digits
    // Pattern: [digit]SI[YY][BRANCH][numbers]
    // Example: 1SI23IS117 -> IS
    const branchMatch = localPart.match(/\d+SI\d{2}([A-Z]{2,3})\d+/);
    const branchCode = branchMatch ? branchMatch[1] : null;
    const branch = branchCode && BRANCH_MAP[branchCode] ? BRANCH_MAP[branchCode] : branchCode || 'Unknown';
    
    // Extract batch year (2-digit year after 'SI')
    // Example: 1SI23IS117 -> 23
    const yearMatch = localPart.match(/SI(\d{2})/);
    const batchYear = yearMatch ? parseInt(yearMatch[1]) : null;
    
    // Calculate passing year (batch year + 4 years for undergraduate program)
    // 23 -> 2023 + 4 = 2027
    let passingYear = null;
    if (batchYear !== null) {
      const fullYear = 2000 + batchYear;
      passingYear = fullYear + 4;
    } else {
      // Fallback to current year + 4
      passingYear = new Date().getFullYear() + 4;
    }
    
    return {
      usn,
      branch,
      branchCode,
      passingYear,
      batchYear: batchYear ? 2000 + batchYear : null,
      parsed: true
    };
  } catch (error) {
    console.error('Error parsing email:', error);
    
    // Return fallback values
    return {
      usn: email.split('@')[0].toUpperCase(),
      branch: 'Unknown',
      branchCode: null,
      passingYear: new Date().getFullYear() + 4,
      batchYear: null,
      parsed: false
    };
  }
};

/**
 * Validate if email is from allowed domain
 * @param {string} email - Email to validate
 * @param {string} allowedDomain - Allowed domain (default: sit.ac.in)
 * @returns {boolean} Whether email is valid
 */
export const validateEmailDomain = (email, allowedDomain = 'sit.ac.in') => {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().endsWith(`@${allowedDomain}`);
};

/**
 * Generate a random 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  // Generate random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default {
  parseEmailToUSNBranchYear,
  validateEmailDomain,
  generateOTP,
  BRANCH_MAP
};
