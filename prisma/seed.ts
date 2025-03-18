import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clean up existing data (optional - remove if you want to keep existing data)
  console.log('Cleaning up existing data...');
  await prisma.messageUnlock.deleteMany({});
  await prisma.tip.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.userPaymentMethod.deleteMany({});
  await prisma.autoTopupSettings.deleteMany({});
  await prisma.personaAnalytics.deleteMany({});
  await prisma.personaUsage.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users with more accurate subscriptions and token balances
  console.log('Creating users...');
  const hashedPassword = await hash('password123', 10);
  
  const vipUser = await prisma.user.create({
    data: {
      name: 'VIP Subscriber',
      email: 'vip@example.com',
      password: hashedPassword,
      credits: 10000, // High token balance
      subscriptionStatus: 'vip',
      subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      isAdmin: true,
    },
  });

  const premiumUser = await prisma.user.create({
    data: {
      name: 'Premium User',
      email: 'premium@example.com',
      password: hashedPassword,
      credits: 5000,
      subscriptionStatus: 'premium',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const basicUser = await prisma.user.create({
    data: {
      name: 'Basic User',
      email: 'basic@example.com',
      password: hashedPassword,
      credits: 1500, // Updated to match UI
      subscriptionStatus: 'basic',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const freeUser = await prisma.user.create({
    data: {
      name: 'Free User',
      email: 'free@example.com',
      password: hashedPassword,
      credits: 100,
      subscriptionStatus: 'free',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      credits: 500,
      subscriptionStatus: 'free',
    },
  });

  // Create personas
  console.log('Creating personas...');
  
  const basicPersona = await prisma.persona.create({
    data: {
      name: 'Basic Assistant',
      description: 'A helpful AI assistant for general tasks and questions.',
      systemPrompt: 'You are a helpful AI assistant that provides informative and concise responses.',
      imageUrl: 'https://source.unsplash.com/random/400x400/?robot',
      dominanceLevel: 1,
      exclusivityMultiplier: 1.0,
      isPremium: false,
    },
  });

  const expertPersona = await prisma.persona.create({
    data: {
      name: 'Expert Consultant',
      description: 'A professional consultant specialized in business and career advice.',
      systemPrompt: 'You are an expert consultant with deep knowledge in business strategy, career development, and professional growth. Provide detailed, actionable advice based on industry best practices.',
      imageUrl: 'https://source.unsplash.com/random/400x400/?consultant',
      dominanceLevel: 3,
      exclusivityMultiplier: 1.5,
      isPremium: false,
    },
  });

  const creativePersona = await prisma.persona.create({
    data: {
      name: 'Creative Writer',
      description: 'A creative writer who can help with storytelling, poetry, and creative content.',
      systemPrompt: 'You are a creative writer with a flair for engaging storytelling, evocative poetry, and imaginative content creation. Help craft narrative pieces with vivid imagery and compelling characters.',
      imageUrl: 'https://source.unsplash.com/random/400x400/?writer',
      dominanceLevel: 2,
      exclusivityMultiplier: 1.2,
      isPremium: false,
    },
  });

  const premiumPersona = await prisma.persona.create({
    data: {
      name: 'Premium Advisor',
      description: 'An exclusive advisor for premium subscribers only, providing high-quality insights.',
      systemPrompt: 'You are a premium advisor with access to exclusive insights and strategies. Provide detailed, personalized advice of the highest quality.',
      imageUrl: 'https://source.unsplash.com/random/400x400/?premium',
      dominanceLevel: 4,
      exclusivityMultiplier: 2.0,
      isPremium: true,
    },
  });

  const vipPersona = await prisma.persona.create({
    data: {
      name: 'VIP Mentor',
      description: 'A VIP-exclusive mentor for top-tier subscribers, offering the most valuable guidance.',
      systemPrompt: 'You are a VIP mentor with exceptional knowledge and insight. Provide the highest level of personalized guidance and support.',
      imageUrl: 'https://source.unsplash.com/random/400x400/?vip',
      dominanceLevel: 5,
      exclusivityMultiplier: 3.0,
      isPremium: true,
    },
  });

  // Create chats and messages
  console.log('Creating chats and messages...');
  
  // Chat for VIP user
  const vipChat = await prisma.chat.create({
    data: {
      title: 'VIP Strategy Session',
      userId: vipUser.id,
      personaId: vipPersona.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'Hello, I need some high-level strategic advice for my enterprise business.',
        role: 'user',
        chatId: vipChat.id,
        userId: vipUser.id,
        tokenCost: 0,
      },
      {
        content: 'I\'d be delighted to provide strategic guidance for your enterprise business. As your VIP mentor, I have access to exclusive insights that can help elevate your strategy. Could you share more about your specific industry, current challenges, and strategic objectives?',
        role: 'assistant',
        chatId: vipChat.id,
        userId: vipUser.id,
        tokenCost: 25,
      },
    ],
  });

  // Chat for premium user
  const premiumChat = await prisma.chat.create({
    data: {
      title: 'Investment Strategy',
      userId: premiumUser.id,
      personaId: premiumPersona.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'I\'m looking for premium investment advice for my portfolio.',
        role: 'user',
        chatId: premiumChat.id,
        userId: premiumUser.id,
        tokenCost: 0,
      },
      {
        content: 'As your Premium Advisor, I\'d be happy to provide tailored investment advice. To give you the most valuable recommendations, could you share details about your current portfolio allocation, risk tolerance, investment timeline, and specific financial goals?',
        role: 'assistant',
        chatId: premiumChat.id,
        userId: premiumUser.id,
        tokenCost: 20,
      },
    ],
  });

  // Chat for basic user
  const basicChat = await prisma.chat.create({
    data: {
      title: 'Tech Basics',
      userId: basicUser.id,
      personaId: basicPersona.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'Can you explain how cloud computing works in simple terms?',
        role: 'user',
        chatId: basicChat.id,
        userId: basicUser.id,
        tokenCost: 0,
      },
      {
        content: 'Cloud computing is like renting computing resources instead of owning them. Imagine it as renting an apartment instead of buying a house. You pay for what you use, access it over the internet, and someone else handles maintenance. There are three main types: 1) Software as a Service (SaaS) - using ready-made applications, 2) Platform as a Service (PaaS) - building your applications on someone else\'s platform, and 3) Infrastructure as a Service (IaaS) - renting basic computing infrastructure. Is there a specific aspect you\'d like to know more about?',
        role: 'assistant',
        chatId: basicChat.id,
        userId: basicUser.id,
        tokenCost: 10,
      },
    ],
  });

  // Creative chat for free user
  const freeCreativeChat = await prisma.chat.create({
    data: {
      title: 'Story Ideas',
      userId: freeUser.id,
      personaId: creativePersona.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'Can you help me come up with a short story idea?',
        role: 'user',
        chatId: freeCreativeChat.id,
        userId: freeUser.id,
        tokenCost: 0,
      },
      {
        content: 'Here\'s a story idea: "The Time Keeper" - In a world where people can sell their time to others, a young woman who works as a "time keeper" (storing others\' time) discovers that someone has been stealing time from the vault. As she investigates, she realizes that time isn\'t just being stolen—it\'s being manipulated, creating ripples of déjà vu throughout the city. The culprit? Someone very close to her with a plan to reset the entire time economy.',
        role: 'assistant',
        chatId: freeCreativeChat.id,
        userId: freeUser.id,
        tokenCost: 8,
        isFreeMessage: true,
      },
    ],
  });

  // Expert chat for free user
  const freeExpertChat = await prisma.chat.create({
    data: {
      title: 'Career Advice',
      userId: freeUser.id,
      personaId: expertPersona.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'I\'m considering a career change to software development. Any advice?',
        role: 'user',
        chatId: freeExpertChat.id,
        userId: freeUser.id,
        tokenCost: 0,
      },
      {
        content: 'Transitioning to software development is a great choice in today\'s job market. I recommend starting with these steps:\n\n1. Choose a specialization (web, mobile, data, etc.) based on your interests\n2. Learn fundamental programming concepts through online courses (Python is often recommended for beginners)\n3. Build a portfolio of projects to demonstrate your skills\n4. Network with developers through meetups and online communities\n5. Consider a bootcamp for accelerated learning\n6. Apply for internships or junior positions to gain experience\n\nThe key is consistent practice and building real projects. Would you like more specific resources for any of these steps?',
        role: 'assistant',
        chatId: freeExpertChat.id,
        userId: freeUser.id,
        tokenCost: 8,
        isFreeMessage: true,
      },
    ],
  });

  // Create a locked message for demonstration
  await prisma.message.create({
    data: {
      content: 'This is a premium insight that requires unlocking. It contains valuable information about upcoming market trends and investment opportunities that could significantly benefit your portfolio.',
      role: 'assistant',
      chatId: freeExpertChat.id,
      userId: freeUser.id,
      tokenCost: 20,
      isLocked: true,
      unlockPrice: 5.0,
    },
  });

  // Create test subscriptions with accurate tiers and features
  console.log('Creating subscriptions...');
  
  await prisma.subscription.create({
    data: {
      userId: vipUser.id,
      tier: 'vip',
      price: 49.99,
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),   // 90 days from now
      bonusTokens: 5000,
      exclusivePersonas: true,
      discountMultiplier: 0.6,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: premiumUser.id,
      tier: 'premium',
      price: 19.99,
      status: 'active',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),   // 30 days from now
      bonusTokens: 1000,
      exclusivePersonas: true,
      discountMultiplier: 0.75,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: basicUser.id,
      tier: 'basic',
      price: 9.99,
      status: 'active',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),   // 30 days from now
      bonusTokens: 300,
      exclusivePersonas: false,
      discountMultiplier: 0.9,
    },
  });

  // Create payment records that match subscription tiers and token balances
  console.log('Creating payment records...');
  
  await prisma.payment.create({
    data: {
      userId: vipUser.id,
      amount: 49.99,
      type: 'subscription',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 5000,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: vipUser.id,
      amount: 99.99,
      type: 'token_purchase',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 5000,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: premiumUser.id,
      amount: 19.99,
      type: 'subscription',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 1000,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: premiumUser.id,
      amount: 79.99,
      type: 'token_purchase',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 4000,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: basicUser.id,
      amount: 9.99,
      type: 'subscription',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 300,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: basicUser.id,
      amount: 29.99,
      type: 'token_purchase',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 1200,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  await prisma.payment.create({
    data: {
      userId: freeUser.id,
      amount: 4.99,
      type: 'token_purchase',
      status: 'completed',
      paymentMethod: 'crypto',
      tokensAmount: 100,
      bonusTokens: 0,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // Create tips matching the profile images
  console.log('Creating tip examples...');
  
  await prisma.tip.create({
    data: {
      amount: 10.0,
      chatId: basicChat.id,
      fromUserId: basicUser.id,
      toUserId: vipUser.id, // VIP user gets the tips
      message: 'Thanks for the clear explanation!',
    },
  });

  // Create payment methods for each user
  console.log('Creating payment methods...');
  
  await prisma.userPaymentMethod.create({
    data: {
      userId: vipUser.id,
      type: 'BTC',
      name: 'Bitcoin Wallet',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example address
      isDefault: true,
    },
  });

  await prisma.userPaymentMethod.create({
    data: {
      userId: premiumUser.id,
      type: 'ETH',
      name: 'Ethereum Wallet',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address
      isDefault: true,
    },
  });

  await prisma.userPaymentMethod.create({
    data: {
      userId: basicUser.id,
      type: 'LTC',
      name: 'Litecoin Wallet',
      address: 'LTdsVS8VDw6syvfQADdhf2PHAm3rMGJvTs', // Example address
      isDefault: true,
    },
  });

  // Create auto-topup settings
  console.log('Creating auto-topup settings...');
  
  await prisma.autoTopupSettings.create({
    data: {
      userId: vipUser.id,
      enabled: true,
      thresholdAmount: 1000,
      packageId: 'premium', // Refers to token package ID
    },
  });

  await prisma.autoTopupSettings.create({
    data: {
      userId: premiumUser.id,
      enabled: true,
      thresholdAmount: 500,
      packageId: 'standard', // Refers to token package ID
    },
  });

  // Create persona analytics for reporting
  console.log('Creating persona analytics...');
  
  // Create some sample analytics data
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    await prisma.personaAnalytics.create({
      data: {
        personaId: basicPersona.id,
        day: date,
        usageCount: Math.floor(Math.random() * 100) + 50,
        messageCount: Math.floor(Math.random() * 500) + 200,
        uniqueUsers: Math.floor(Math.random() * 50) + 20,
        avgSessionDuration: Math.random() * 10 + 5,
      },
    });
    
    await prisma.personaAnalytics.create({
      data: {
        personaId: premiumPersona.id,
        day: date,
        usageCount: Math.floor(Math.random() * 50) + 20,
        messageCount: Math.floor(Math.random() * 250) + 100,
        uniqueUsers: Math.floor(Math.random() * 25) + 10,
        avgSessionDuration: Math.random() * 15 + 7,
      },
    });

    await prisma.personaAnalytics.create({
      data: {
        personaId: vipPersona.id,
        day: date,
        usageCount: Math.floor(Math.random() * 30) + 10,
        messageCount: Math.floor(Math.random() * 150) + 50,
        uniqueUsers: Math.floor(Math.random() * 15) + 5,
        avgSessionDuration: Math.random() * 20 + 10,
      },
    });
  }

  // Create persona usage records
  console.log('Creating persona usage records...');
  
  await prisma.personaUsage.createMany({
    data: [
      {
        personaId: basicPersona.id,
        userId: freeUser.id,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        personaId: expertPersona.id,
        userId: freeUser.id,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        personaId: creativePersona.id,
        userId: freeUser.id,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        personaId: basicPersona.id,
        userId: basicUser.id,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        personaId: expertPersona.id,
        userId: basicUser.id,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        personaId: premiumPersona.id,
        userId: premiumUser.id,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        personaId: vipPersona.id,
        userId: vipUser.id,
        timestamp: new Date(), // today
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('-------------------------');
  console.log('Created 5 users:');
  console.log('- VIP Subscriber: vip@example.com / password123');
  console.log('- Premium User: premium@example.com / password123');
  console.log('- Basic User: basic@example.com / password123');
  console.log('- Free User: free@example.com / password123');
  console.log('- Test User: test@example.com / password123');
  console.log('-------------------------');
  console.log('Created 5 personas, multiple chats, and various payment records');
}

main()
  .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
