// List of common disposable email domains
const disposableEmailDomains = [
    'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 
    'guerrillamail.net', 'sharklasers.com', 'yopmail.com', 'dispostable.com',
    'mailnesia.com', 'mailnator.com', 'trashmail.com', 'trashmail.net',
    'maildrop.cc', '10minutemail.com', 'tempinbox.com', 'spamgourmet.com',
    'throwawaymail.com', 'getairmail.com', 'getnada.com', 'fakeinbox.com',
    'tempmail.net', 'temp-mail.io', 'tempr.email', 'fakemailgenerator.com',
    'emailfake.com', 'emailondeck.com', 'anonbox.net', 'mailcatch.com',
    'tempmailaddress.com', 'mintemail.com', 'tempmailer.com', 'tempmail.ninja'
  ];
  
  // List of common email providers
  const validEmailProviders = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com',
    'gmx.com', 'live.com', 'msn.com', 'uol.com.br', 'bol.com.br',
    'terra.com.br', 'ig.com.br', 'globo.com', 'r7.com', 'zipmail.com.br',
    'globomail.com', 'oi.com.br', 'pop.com.br', 'folha.com.br', 'superig.com.br'
  ];
  
  export function validateEmail(email: string): { isValid: boolean; message: string } {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Formato de email inválido" };
    }
  
    // Check for disposable email domains
    const domain = email.split('@')[1].toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      return { isValid: false, message: "Emails temporários não são permitidos" };
    }
  
    // Check if the domain is from a known provider or allow custom domains
    // This is optional - you can comment this out if you want to allow all domains
    
    if (!validEmailProviders.includes(domain)) {
      // Check if it's likely a corporate/custom domain (has MX records)
      // This would require server-side DNS lookup which is not implemented here
      // For now, we'll allow all non-disposable domains
      return { isValid: false, message: "Email não permitido" };
    }
    
    return { isValid: true, message: "" };
  }