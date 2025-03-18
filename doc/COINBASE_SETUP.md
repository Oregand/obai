# Coinbase Commerce Integration Guide

This guide explains how to set up and use the Coinbase Commerce integration for the OBAI platform.

## Setup Instructions

1. **Create a Coinbase Commerce Account**
   - Sign up at [commerce.coinbase.com](https://commerce.coinbase.com/)
   - Verify your account as needed

2. **Create API Keys**
   - In your Coinbase Commerce dashboard, go to Settings > API Keys
   - Create a new API key
   - Copy the API key to your .env file as `COINBASE_COMMERCE_API_KEY`

3. **Configure Webhooks**
   - In your Coinbase Commerce dashboard, go to Settings > Webhooks
   - Add a new webhook with your endpoint URL: `https://yourdomain.com/api/webhooks/crypto`
   - Copy the Webhook Shared Secret to your .env file as `COINBASE_COMMERCE_WEBHOOK_SECRET`
   - For local testing, you can use a tool like ngrok to create a tunnel to your localhost

4. **Configure Environment Variables**
   - Add to your `.env.local` file:
   ```
   COINBASE_COMMERCE_API_KEY=your-api-key-here
   COINBASE_COMMERCE_WEBHOOK_SECRET=your-webhook-secret-here
   USE_MOCK_CRYPTO=false  # Set to true for development with mock data
   ```

5. **Test the Integration**
   - Start your development server
   - Try making a payment through the crypto payment option
   - Check the logs to verify the webhook is being received correctly

## How It Works

1. **Payment Creation**
   - When a user chooses to pay with crypto, the app creates a charge with Coinbase Commerce
   - Coinbase provides a hosted checkout page URL where users can complete their payment

2. **Payment Verification**
   - Coinbase sends webhook events to your webhook endpoint
   - The webhook handler verifies the signature and processes the payment
   - When a payment is confirmed, tokens are added to the user's account

3. **Development Mode**
   - In development, you can set `USE_MOCK_CRYPTO=true` to use mock data
   - This allows you to test the flow without making real cryptocurrency transactions

## Troubleshooting

- If webhooks aren't being received:
  - Check your webhook URL in the Coinbase Commerce dashboard
  - Verify your server is accessible from the internet (use ngrok for local testing)
  - Check the webhook secret is correctly set

- If payments are being created but not confirming:
  - Check the Coinbase Commerce dashboard for the status of the payment
  - Verify webhook events are being received and processed

- For local development:
  - Use `USE_MOCK_CRYPTO=true` to avoid needing real cryptocurrencies
  - The mock service simulates the payment flow for testing

## Resources

- [Coinbase Commerce Documentation](https://commerce.coinbase.com/docs/)
- [Webhooks Documentation](https://commerce.coinbase.com/docs/api/#webhooks)
- [Charges API](https://commerce.coinbase.com/docs/api/#charges)
