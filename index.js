require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const express = require('express');
const fs = require('fs');

// ==========================================
// ១. ភ្ជាប់ទៅកាន់ FIREBASE ជំនាន់ថ្មី (Modular API)
// ==========================================
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

let serviceAccount;
if (fs.existsSync('/etc/secrets/firebase-key.json')) {
  serviceAccount = require('/etc/secrets/firebase-key.json'); // សម្រាប់ពេលដើរលើ Render
} else {
  serviceAccount = require('./firebase-key.json'); // សម្រាប់ពេលតេស្តលើកុំព្យូទ័រ
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ==========================================
// ២. បង្កើត BOT 
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session()); 

// ==========================================
// ៣. ប៊ូតុង MENU គោល
// ==========================================
const mainMenu = Markup.keyboard([
  ['🛍 មើលទំនិញ', '🛒 កន្ត្រករបស់ខ្ញុំ'],
  ['📞 ទំនាក់ទំនងយើងខ្ញុំ', 'ℹ️ ព័ត៌មានហាង']
]).resize();

bot.start((ctx) => {
  ctx.session = { cart: [] }; 
  const userName = ctx.from.first_name;
  ctx.reply(`សួស្តី ${userName}! សូមស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ។ សូមជ្រើសរើសសេវាកម្មខាងក្រោម៖`, mainMenu);
});

// ==========================================
// ៤. មុខងារបង្ហាញទំនិញពី FIREBASE
// ==========================================
bot.hears('🛍 មើលទំនិញ', async (ctx) => {
  ctx.reply('កំពុងស្វែងរកទំនិញ... ⏳');
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.limit(5).get(); 
    
    if (snapshot.empty) {
      return ctx.reply('សុំទោស! មិនមានទំនិញនៅពេលនេះទេ។', mainMenu);
    }

    snapshot.forEach(doc => {
      const p = doc.data();
      ctx.replyWithPhoto(p.imageUrl || 'https://via.placeholder.com/150', {
        caption: `📦 **${p.name}**\n💵 តម្លៃ: $${p.price}\n📝 ព័ត៌មាន: ${p.description}`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback(`🛒 ទិញ ($${p.price})`, `addcart_${doc.id}_${p.name}_${p.price}`)
        ])
      });
    });
  } catch (error) {
    console.error(error);
    ctx.reply('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធទិន្នន័យ។');
  }
});

// ==========================================
// ៥. មុខងារបន្ថែមចូលកន្ត្រក (Add to Cart)
// ==========================================
bot.action(/addcart_(.+)/, (ctx) => {
  const data = ctx.match[1].split('_'); 
  const productId = data[0];
  const productName = data[1];
  const productPrice = parseFloat(data[2]);

  if (!ctx.session) ctx.session = { cart: [] };
  if (!ctx.session.cart) ctx.session.cart = [];

  ctx.session.cart.push({ id: productId, name: productName, price: productPrice });
  
  ctx.answerCbQuery(`✅ បានបន្ថែម ${productName} ចូលកន្ត្រក!`);
  ctx.reply(`✅ អ្នកបានបន្ថែម **${productName}** (តម្លៃ $${productPrice}) ចូលកន្ត្រក។ ចុច "🛒 កន្ត្រករបស់ខ្ញុំ" ដើម្បីគិតលុយ។`, { parse_mode: 'Markdown' });
});

// ==========================================
// ៦. មុខងារពិនិត្យកន្ត្រក និង គិតលុយ 
// ==========================================
bot.hears('🛒 កន្ត្រករបស់ខ្ញុំ', (ctx) => {
  const cart = ctx.session?.cart || [];
  if (cart.length === 0) {
    return ctx.reply('កន្ត្រករបស់អ្នកទទេស្អាត។ សូមជ្រើសរើសទំនិញសិន! 🛍');
  }

  let total = 0;
  let receipt = '📝 **វិក្កយបត្របណ្តោះអាសន្ន៖**\n\n';
  cart.forEach((item, index) => {
    receipt += `${index + 1}. ${item.name} - $${item.price}\n`;
    total += item.price;
  });
  receipt += `\n💵 **សរុប: $${total}**`;

  ctx.reply(receipt, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✅ យល់ព្រមបញ្ជាទិញ (Checkout)', 'checkout')],
      [Markup.button.callback('🗑 លុបចោលទាំងអស់', 'clear_cart')]
    ])
  });
});

bot.action('clear_cart', (ctx) => {
  ctx.session.cart = [];
  ctx.answerCbQuery('🗑 បានលុបកន្ត្រកដោយជោគជ័យ!');
  ctx.editMessageText('កន្ត្រករបស់អ្នកត្រូវបានលុប។');
});

bot.action('checkout', (ctx) => {
  ctx.answerCbQuery('កំពុងរៀបចំការបញ្ជាទិញ...');
  ctx.reply('ដើម្បីបញ្ចប់ការបញ្ជាទិញ សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ញើលេខទូរស័ព្ទរបស់អ្នកមកកាន់យើងខ្ញុំ៖', 
    Markup.keyboard([
      [Markup.button.contactRequest('📱 ផ្ញើលេខទូរស័ព្ទរបស់ខ្ញុំ')]
    ]).oneTime().resize()
  );
});

bot.on('contact', async (ctx) => {
  const cart = ctx.session?.cart || [];
  if (cart.length === 0) return ctx.reply('មិនមានទំនិញក្នុងកន្ត្រកទេ។', mainMenu);

  const phone = ctx.message.contact.phone_number;
  const user = ctx.from;
  
  let total = 0;
  cart.forEach(item => total += item.price);

  try {
    const orderRef = await db.collection('orders').add({
      userId: user.id,
      customerName: user.first_name,
      phone: phone,
      items: cart,
      totalAmount: total,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp() // ប្រើប្រាស់ FieldValue តាមទម្រង់ថ្មី
    });

    ctx.session.cart = [];
    ctx.reply(`✅ ការបញ្ជាទិញទទួលបានជោគជ័យ! \n\nលេខកូដវិក្កយបត្រ៖ #${orderRef.id}\nក្រុមការងារនឹងទាក់ទងទៅលេខ ${phone} ក្នុងពេលឆាប់ៗនេះ។`, mainMenu);

    const adminMsg = `🚨 **មានការបញ្ជាទិញថ្មី!**\n\n👤 អតិថិជន: ${user.first_name}\n📱 លេខទូរស័ព្ទ: ${phone}\n💰 ទឹកប្រាក់សរុប: $${total}\n🆔 លេខវិក្កយបត្រ: ${orderRef.id}`;
    bot.telegram.sendMessage(process.env.ADMIN_ID, adminMsg, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error(error);
    ctx.reply('សុំទោស មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។', mainMenu);
  }
});

// ==========================================
// ៧. ចាប់ផ្តើម EXPRESS SERVER សម្រាប់ RENDER
// ==========================================
const app = express();
app.use(express.json());

if (process.env.RENDER_EXTERNAL_URL) {
  app.use(bot.webhookCallback('/telegram-webhook'));
  bot.telegram.setWebhook(`${process.env.RENDER_EXTERNAL_URL}/telegram-webhook`);
  console.log('Webhook is set!');
} else {
  bot.launch();
  console.log('Bot is running on Local Polling...');
}

app.get('/', (req, res) => res.send('E-commerce Bot Server is Running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));