export const checkRequirements = (password: string) => {
  return {
    minChar: password.length >= 6,
    upperCase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password),
    specialChar: /(?=.*[@$!%*?&])/.test(password),
  };
};
