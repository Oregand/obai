// Payment service factory - selects between mock and real service
import mockCryptoService from './mockCryptoService';
import coinbasePaymentService from './coinbasePaymentService';

// Use mock service in development mode if configured
const useMockService = process.env.USE_MOCK_CRYPTO === 'true';

// Export the appropriate service
export default useMockService ? mockCryptoService : coinbasePaymentService;
