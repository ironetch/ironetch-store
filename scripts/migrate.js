const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration...');

  // 1. Migrate Products
  try {
    const pPath = path.join(process.cwd(), 'src/data/products.json');
    if (fs.existsSync(pPath)) {
      const pData = JSON.parse(fs.readFileSync(pPath, 'utf8'));
      for (const p of pData) {
        await prisma.product.upsert({
          where: { id: p.id },
          update: {
            title: p.title,
            price: p.price,
            weight: p.weight,
            stock: p.stock,
            category: p.category,
            description: p.description,
            materials: p.materials,
            imageUrl: p.imageUrl,
            isCustom: p.isCustom
          },
          create: {
            id: p.id,
            title: p.title,
            price: p.price,
            weight: p.weight,
            stock: p.stock,
            category: p.category,
            description: p.description,
            materials: p.materials,
            imageUrl: p.imageUrl,
            isCustom: p.isCustom
          }
        });
      }
      console.log(`Migrated ${pData.length} products`);
    }
  } catch(e) { console.error('Products error', e); }

  // 2. Migrate Custom Orders
  try {
    const oPath = path.join(process.cwd(), 'src/data/custom-orders.json');
    if (fs.existsSync(oPath)) {
      const oData = JSON.parse(fs.readFileSync(oPath, 'utf8'));
      for (const o of oData) {
        await prisma.customOrder.upsert({
          where: { id: o.id },
          update: {},
          create: {
            id: o.id,
            status: o.status,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            productId: o.productId,
            productTitle: o.productTitle,
            material: o.material,
            quantity: o.quantity,
            price: o.price,
            imageDataUrl: o.imageDataUrl,
            notes: o.notes,
            stripeInvoiceId: o.stripeInvoiceId,
            invoiceUrl: o.invoiceUrl,
            invoiceError: o.invoiceError
          }
        });
      }
      console.log(`Migrated ${oData.length} custom orders`);
    }
  } catch(e) { console.error('Custom orders error', e); }

  console.log('Migration complete');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
