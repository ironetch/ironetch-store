import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

const productsPath = path.resolve(__dirname, '../src/data/products.json');

async function syncProducts() {
  console.log('--- STARTING STRIPE SYNC ---');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('WARN: No STRIPE_SECRET_KEY found in .env. Using mock mode.');
  }

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  for (const product of products) {
    try {
      console.log(`Syncing: ${product.title}...`);
      
      const stripeProduct = await stripe.products.create({
        name: product.title,
        description: product.description,
        metadata: {
          id: product.id,
          weight: product.weight.toString(),
          material: product.materials.join(', '),
          category: product.category,
          agent_enabled: 'true' // For Stripe Agentic Commerce Suite
        },
        default_price_data: {
          currency: 'cad',
          unit_amount: Math.round(product.price * 100),
        },
      });

      console.log(`SUCCESS: ${product.title} synced as ${stripeProduct.id}`);
    } catch (error: any) {
      console.error(`ERROR syncing ${product.title}:`, error.message);
    }
  }

  console.log('--- SYNC COMPLETE ---');
}

syncProducts();
