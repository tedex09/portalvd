export const getClientInfo = (req: any) => {
  const userAgent = req.headers['user-agent'];
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Basic device detection
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const isTablet = /Tablet|iPad/i.test(userAgent);
  const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    userAgent,
    ip,
    device
  };
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Mobile|Android|iPhone/i.test(navigator.userAgent);
};