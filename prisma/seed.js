// This script will seed your database with initial data
// Including default personas and test users

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Generate a consistent ID based on the name
function generateId(name) {
  return `persona_${name.toLowerCase().replace(/\s+/g, '_')}_${crypto.createHash('md5').update(name).digest('hex').substring(0, 8)}`;
}

// Generate user ID
function generateUserId(prefix) {
  return `${prefix}_user_${crypto.randomBytes(4).toString('hex')}`;
}

async function seed() {
  console.log('Starting database seeding...');
  
  console.log('Cleaning up existing data...');
  // Clear existing data first
  await prisma.messageUnlock.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.personaAnalytics.deleteMany({});
  await prisma.personaUsage.deleteMany({});
  await prisma.tip.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.userPaymentMethod.deleteMany({});
  await prisma.autoTopupSettings.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.persona.deleteMany({});

  // Create default personas
  const personas = [
    {
      id: generateId('Friendly Helper'),
      name: 'Friendly Helper',
      description: 'A friendly AI assistant that helps with everyday questions.',
      systemPrompt: 'You are a friendly, helpful AI assistant. You are enthusiastic and enjoy helping people with a variety of tasks.',
      imageUrl: null,
      isPublic: true,
      tipEnabled: true,
      tipSuggestions: [1, 3, 5],
      lockMessageChance: 0.05,
      lockMessagePrice: 0.5,
      tokenRatePerMessage: 1.0,
      tokenRatePerMinute: 0.0,
      isPremium: false,
      dominanceLevel: 1,
      exclusivityMultiplier: 1.0
    },
    {
      id: generateId('Professional Expert'),
      name: 'Professional Expert',
      description: 'A knowledgeable professional who provides well-researched answers.',
      systemPrompt: 'You are a professional expert AI with deep knowledge across many domains. Provide well-researched, accurate information.',
      imageUrl: null,
      isPublic: true,
      tipEnabled: true,
      tipSuggestions: [2, 5, 10],
      lockMessageChance: 0.1,
      lockMessagePrice: 1.0,
      tokenRatePerMessage: 2.0,
      tokenRatePerMinute: 0.0,
      isPremium: true,
      dominanceLevel: 3,
      exclusivityMultiplier: 1.5
    },
    {
      id: generateId('Creative Writer'),
      name: 'Creative Writer',
      description: 'An imaginative storyteller who can craft creative narratives.',
      systemPrompt: 'You are a creative writer with a flair for storytelling. Help users with creative writing, stories, and imaginative scenarios.',
      imageUrl: null,
      isPublic: true,
      tipEnabled: true,
      tipSuggestions: [1, 3, 5],
      lockMessageChance: 0.05,
      lockMessagePrice: 0.5,
      tokenRatePerMessage: 1.5,
      tokenRatePerMinute: 0.0,
      isPremium: false,
      dominanceLevel: 2,
      exclusivityMultiplier: 1.2
    }
  ];

  console.log('Creating personas...');
  for (const persona of personas) {
    await prisma.persona.create({
      data: persona
    });
  }
  console.log(`Created ${personas.length} personas`);

  // Create test users with different subscription levels and characteristics
  console.log('Creating users...');
  
  // Hash password - Use bcrypt to hash the password "password123"
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed password for all test users: ${hashedPassword}`);
  
  const testUsers = [
    {
      id: generateUserId('free'),
      name: 'Free User',
      email: 'free@example.com',
      password: hashedPassword,
      subscriptionStatus: 'free',
      credits: 25,
      emailVerified: new Date()
    },
    {
      id: generateUserId('basic'),
      name: 'Basic Subscriber',
      email: 'basic@example.com',
      password: hashedPassword,
      subscriptionStatus: 'basic',
      credits: 150,
      emailVerified: new Date()
    },
    {
      id: generateUserId('premium'),
      name: 'Premium Subscriber',
      email: 'premium@example.com',
      password: hashedPassword,
      subscriptionStatus: 'premium',
      credits: 500,
      emailVerified: new Date()
    },
    {
      id: generateUserId('vip'),
      name: 'VIP Subscriber',
      email: 'vip@example.com',
      password: hashedPassword,
      subscriptionStatus: 'vip',
      credits: 2000,
      emailVerified: new Date()
    },
    {
      id: generateUserId('admin'),
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      subscriptionStatus: 'vip',
      credits: 9999,
      isAdmin: true,
      emailVerified: new Date()
    }
  ];
  
  const createdUsers = [];
  for (const user of testUsers) {
    try {
      const createdUser = await prisma.user.create({
        data: user
      });
      createdUsers.push(createdUser);
      console.log(`Created user: ${createdUser.name} (${createdUser.email})`);
    } catch (error) {
      console.log(`Skipping user creation for ${user.email} due to error:`, error.message);
    }
  }
  
  // Create chats and messages for each user
  console.log('Creating chats and messages...');
  
  for (const user of createdUsers) {
    // Create 1-3 chats per user with different personas
    const chatCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < chatCount; i++) {
      // Select a random persona
      const personaIndex = Math.floor(Math.random() * personas.length);
      const persona = personas[personaIndex];
      
      // Create a chat
      const chat = await prisma.chat.create({
        data: {
          title: `Chat about ${['Technology', 'Health', 'Finance', 'Education', 'Entertainment'][Math.floor(Math.random() * 5)]}`,
          userId: user.id,
          personaId: persona.id
        }
      });
      
      // Create 5-15 messages per chat
      const messageCount = Math.floor(Math.random() * 10) + 5;
      const messagesData = [];
      
      for (let j = 0; j < messageCount; j++) {
        const isUserMessage = j % 2 === 0;
        const isLocked = !isUserMessage && Math.random() < 0.2; // 20% chance for assistant messages to be locked
        
        const message = await prisma.message.create({
          data: {
            content: isUserMessage 
              ? `User message ${j/2 + 1}: ${['Can you help me?', 'Tell me more about this', 'What do you think?', 'That\'s interesting'][Math.floor(Math.random() * 4)]}` 
              : `Assistant message ${Math.floor(j/2) + 1}: ${['I\'d be happy to help!', 'Here\'s what I think...', 'Based on my knowledge...', 'Let me explain that...'][Math.floor(Math.random() * 4)]}`,
            role: isUserMessage ? 'user' : 'assistant',
            chatId: chat.id,
            userId: user.id,
            isLocked: isLocked,
            unlockPrice: isLocked ? parseFloat((0.5 + Math.random() * 2).toFixed(2)) : null,
            tokenCost: isUserMessage ? 0 : parseFloat((0.1 + Math.random() * 0.9).toFixed(2)),
            isFreeMessage: j < 2 // First message pair is free
          }
        });
        
        messagesData.push(message);
        
        // Add message unlocks for some locked messages
        if (isLocked && Math.random() < 0.5) {
          await prisma.messageUnlock.create({
            data: {
              messageId: message.id,
              userId: user.id,
              amount: message.unlockPrice || 1.0
            }
          });
        }
      }
    }
  }
  
  // Create subscriptions for users with subscription status
  console.log('Creating subscriptions...');
  
  const subscriptionTiers = {
    'basic': { price: 9.99, exclusivePersonas: false, discountMultiplier: 0.9 },
    'premium': { price: 19.99, exclusivePersonas: true, discountMultiplier: 0.8 },
    'vip': { price: 49.99, exclusivePersonas: true, discountMultiplier: 0.7 }
  };
  
  for (const user of createdUsers) {
    if (user.subscriptionStatus !== 'free') {
      const tierDetails = subscriptionTiers[user.subscriptionStatus];
      
      // Create payment for subscription
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: tierDetails.price,
          currency: 'USD',
          type: 'subscription',
          status: 'completed',
          paymentMethod: 'credit_card',
          paymentIntent: `pi_${crypto.randomBytes(8).toString('hex')}`,
          completedAt: new Date()
        }
      });
      
      // Create subscription linked to payment
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      await prisma.subscription.create({
        data: {
          userId: user.id,
          paymentId: payment.id,
          tier: user.subscriptionStatus,
          price: tierDetails.price,
          status: 'active',
          startDate: new Date(),
          endDate: endDate,
          autoRenew: true,
          bonusTokens: user.subscriptionStatus === 'basic' ? 100 : user.subscriptionStatus === 'premium' ? 300 : 1000,
          exclusivePersonas: tierDetails.exclusivePersonas,
          discountMultiplier: tierDetails.discountMultiplier
        }
      });
    }
  }
  
  // Create payment records for users
  console.log('Creating payment records...');
  
  for (const user of createdUsers) {
    // Create 0-5 token purchase payments
    const paymentCount = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < paymentCount; i++) {
      const tokenAmounts = [100, 200, 500, 1000, 2000];
      const tokenAmount = tokenAmounts[Math.floor(Math.random() * tokenAmounts.length)];
      const tokenPrice = tokenAmount * 0.01; // 1 cent per token
      
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: tokenPrice,
          currency: 'USD',
          type: 'token_purchase',
          status: 'completed',
          paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'crypto',
          paymentIntent: `pi_${crypto.randomBytes(8).toString('hex')}`,
          tokensAmount: tokenAmount,
          bonusTokens: Math.floor(tokenAmount * 0.1), // 10% bonus
          completedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
        }
      });
    }
  }
  
  // Create tip example
  console.log('Creating tip example...');
  
  // Get a random premium or VIP user
  const tipSender = createdUsers.find(u => u.subscriptionStatus === 'premium' || u.subscriptionStatus === 'vip');
  
  if (tipSender) {
    // Get a chat from this user
    const chat = await prisma.chat.findFirst({
      where: { userId: tipSender.id }
    });
    
    if (chat) {
      // Create payment for tip
      const payment = await prisma.payment.create({
        data: {
          userId: tipSender.id,
          amount: 5.0,
          currency: 'USD',
          type: 'tip',
          status: 'completed',
          paymentMethod: 'credits',
          completedAt: new Date()
        }
      });
      
      // Create tip
      await prisma.tip.create({
        data: {
          amount: 5.0,
          chatId: chat.id,
          fromUserId: tipSender.id,
          toUserId: createdUsers[0].id, // Send to first user as recipient
          paymentId: payment.id,
          message: 'Great conversation, thank you!'
        }
      });
    }
  }
  
  // Create payment methods
  console.log('Creating payment methods...');
  
  for (const user of createdUsers) {
    if (user.subscriptionStatus !== 'free') {
      await prisma.userPaymentMethod.create({
        data: {
          userId: user.id,
          type: 'ETH',
          name: 'My Ethereum Wallet',
          address: `0x${crypto.randomBytes(20).toString('hex')}`,
          isDefault: true,
          
        }
      });
      
      if (user.subscriptionStatus === 'vip') {
        await prisma.userPaymentMethod.create({
          data: {
            userId: user.id,
            type: 'BTC',
            name: 'My Bitcoin Wallet',
            address: `bc1${crypto.randomBytes(20).toString('hex')}`,
            isDefault: false
          }
        });
      }
    }
  }
  
  // Create auto-topup settings
  console.log('Creating auto-topup settings...');
  
  const premiumUser = createdUsers.find(u => u.subscriptionStatus === 'premium');
  if (premiumUser) {
    const paymentMethod = await prisma.userPaymentMethod.findFirst({
      where: { userId: premiumUser.id }
    });
    
    if (paymentMethod) {
      await prisma.autoTopupSettings.create({
        data: {
          userId: premiumUser.id,
          enabled: true,
          thresholdAmount: 10.0,
          packageId: '100_tokens',
          paymentMethodId: paymentMethod.id,
          lastTopupAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      });
    }
  }
  
  // Create persona analytics
  console.log('Creating persona analytics...');
  
  // Create analytics data for the last 30 days
  const today = new Date();
  
  for (const persona of personas) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Use upsert instead of create to avoid unique constraint errors
      await prisma.personaAnalytics.upsert({
        where: {
          personaId_day: {
            personaId: persona.id,
            day: date
          }
        },
        update: {
          messageCount: Math.floor(Math.random() * 100) + 10,
          usageCount: Math.floor(Math.random() * 50) + 5,
          uniqueUsers: Math.floor(Math.random() * 20) + 2,
          avgSessionDuration: Math.random() * 10 + 1
        },
        create: {
          personaId: persona.id,
          day: date,
          messageCount: Math.floor(Math.random() * 100) + 10,
          usageCount: Math.floor(Math.random() * 50) + 5,
          uniqueUsers: Math.floor(Math.random() * 20) + 2,
          avgSessionDuration: Math.random() * 10 + 1
        }
      });
    }
  }
  
  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
