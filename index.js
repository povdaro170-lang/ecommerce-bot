import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import { db } from './firebase.js';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, limit, serverTimestamp } from 'firebase/firestore';

const bot = new Telegraf(process.env.BOT_TOKEN);

// ==========================================
// ១. ប្រព័ន្ធចងចាំជំហានបញ្ជាទិញ (Checkout State)
// ==========================================
const checkoutState = new Map(); 

// ម៉ឺនុយគោលខាងក្រោម
const mainMenu = Markup.keyboard([
  ['🛍 មើលទំនិញ', '🛒 កន្ត្រករបស់ខ្ញុំ'],
  ['📞 ទំនាក់ទំនងយើងខ្ញុំ', 'ℹ️ ព័ត៌មានហាង']
]).resize();

// ==========================================
// ២. មុខងារបញ្ជាទូទៅ (Commands)
// ==========================================
bot.start((ctx) => {
  checkoutState.delete(ctx.from.id); // លុបការចងចាំចាស់ៗចោលពេលចុច Start
  ctx.reply(`សួស្តីបង ${ctx.from.first_name}! 👋\nសូមស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ។ តើមានអ្វីឱ្យយើងខ្ញុំជួយបងដែរ?`, mainMenu);
});

bot.hears('📞 ទំនាក់ទំនងយើងខ្ញុំ', (ctx) => ctx.reply('សូមទាក់ទងមកកាន់យើងខ្ញុំតាមរយៈលេខ៖ 012 345 678 ឬ Telegram @admin'));
bot.hears('ℹ️ ព័ត៌មានហាង', (ctx) => ctx.reply('ហាងយើងខ្ញុំមានលក់ទំនិញគ្រប់ប្រភេទ ធានាគុណភាព តម្លៃសមរម្យ និងសេវាកម្មរហ័សទាន់ចិត្ត។'));

// ==========================================
// ៣. មុខងារទាញយកទំនិញពី Firebase
// ==========================================
bot.hears('🛍 មើលទំនិញ', async (ctx) => {
  checkoutState.delete(ctx.from.id);
  const msg = await ctx.reply('កំពុងស្វែងរកទំនិញ... ⏳');
  
  try {
    const snapshot = await getDocs(query(collection(db, 'products'), limit(5)));
    if (snapshot.empty) return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, 'សុំទោស! មិនមានទំនិញនៅពេលនេះទេ។');

    await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id);

    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const imageUrl = p.imageUrl && p.imageUrl.startsWith('http') ? p.imageUrl : 'https://i.imgur.com/33EFdDI.jpg';

      ctx.replyWithPhoto(imageUrl, {
        caption: `📦 **${p.name}**\n💵 តម្លៃ: $${p.price}\n📝 ព័ត៌មាន: ${p.description || ''}`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback(`🛒 បន្ថែមចូលកន្ត្រក ($${p.price})`, `addcart_${docSnap.id}_${p.name}_${p.price}`)
        ])
      }).catch(err => {
        ctx.reply(`📦 **${p.name}**\n💵 តម្លៃ: $${p.price}\n📝 ${p.description || ''}`, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([ Markup.button.callback(`🛒 ទិញ ($${p.price})`, `addcart_${docSnap.id}_${p.name}_${p.price}`) ])
        });
      });
    });
  } catch (error) {
    console.error(error);
    ctx.reply('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធទិន្នន័យ។');
  }
});

// ==========================================
// ៤. មុខងារកន្ត្រក និង បញ្ជាទិញ (Cart & Checkout)
// ==========================================

// បន្ថែមចូលកន្ត្រក
bot.action(/addcart_(.+)/, async (ctx) => {
  const data = ctx.match[1].split('_'); 
  const id = data[0], name = data[1], price = parseFloat(data[2]);

  try {
    await addDoc(collection(db, 'carts'), {
      userId: ctx.from.id,
      productId: id,
      productName: name,
      price: price,
      addedAt: serverTimestamp()
    });
    await ctx.answerCbQuery(`✅ បានបន្ថែម ${name} ចូលកន្ត្រក!`);
  } catch (error) {
    await ctx.answerCbQuery('❌ មានបញ្ហា មិនអាចបន្ថែមបានទេ');
  }
});

// មើលកន្ត្រក
bot.hears('🛒 កន្ត្រករបស់ខ្ញុំ', async (ctx) => {
  checkoutState.delete(ctx.from.id);
  try {
    const q = query(collection(db, 'carts'), where('userId', '==', ctx.from.id));
    const snap = await getDocs(q);

    if (snap.empty) return ctx.reply('🛒 កន្ត្រករបស់អ្នកទទេស្អាត។ សូមជ្រើសរើសទំនិញសិន!', mainMenu);

    let msg = '📝 **វិក្កយបត្របណ្ដោះអាសន្នរបស់អ្នក៖**\n\n';
    let total = 0, count = 1;

    snap.forEach(doc => {
      const item = doc.data();
      msg += `${count}. ${item.productName} - $${item.price}\n`;
      total += item.price;
      count++;
    });
    msg += `\n💵 **សរុប:** $${total.toFixed(2)}`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ យល់ព្រមបញ្ជាទិញ (Checkout)", callback_data: "checkout" }],
          [{ text: "🗑 លុបចោលទាំងអស់", callback_data: "clearcart" }]
        ]
      }
    });
  } catch (error) {
    ctx.reply('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។');
  }
});

// លុបកន្ត្រក
bot.action('clearcart', async (ctx) => {
  try {
    const q = query(collection(db, 'carts'), where('userId', '==', ctx.from.id));
    const snap = await getDocs(q);
    const batch = [];
    snap.forEach(d => batch.push(deleteDoc(doc(db, 'carts', d.id))));
    await Promise.all(batch);

    await ctx.editMessageText('🗑 កន្ត្រករបស់អ្នកត្រូវបានលុបចោលរួចរាល់។');
    await ctx.answerCbQuery('បានលុបជោគជ័យ');
  } catch (error) {
    await ctx.answerCbQuery('មានបញ្ហាពេលលុប');
  }
});

// ==========================================
// ៥. ដំណើរការ Checkout មួយជំហានម្តងៗ (Step-by-Step)
// ==========================================

// ជំហានទី ១៖ សួរលេខទូរស័ព្ទ
bot.action('checkout', async (ctx) => {
  checkoutState.set(ctx.from.id, { step: 'WAITING_PHONE' });
  await ctx.deleteMessage(); // លុបសារចាស់ចោលកុំឱ្យស្អេកស្កះ
  await ctx.reply('ដើម្បីបន្តការបញ្ជាទិញ សូមចុចប៊ូតុងខាងក្រោម ដើម្បីផ្ញើលេខទូរស័ព្ទរបស់អ្នកមកកាន់យើងខ្ញុំ៖ 👇', {
    reply_markup: {
      keyboard: [ [{ text: "📱 ចុចទីនេះដើម្បីផ្ញើលេខទូរស័ព្ទ", request_contact: true }] ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// ជំហានទី ២៖ ទទួលលេខទូរស័ព្ទ រួចសួរទីតាំង (ភ្នំពេញ ឬ ខេត្ត)
bot.on('contact', async (ctx) => {
  const state = checkoutState.get(ctx.from.id);
  if (state && state.step === 'WAITING_PHONE') {
    state.phone = ctx.message.contact.phone_number;
    state.step = 'WAITING_REGION';
    checkoutState.set(ctx.from.id, state);

    await ctx.reply('✅ ទទួលបានលេខទូរស័ព្ទជោគជ័យ!', { reply_markup: { remove_keyboard: true } });
    await ctx.reply('📍 តើអ្នកចង់ឱ្យដឹកជញ្ជូនទៅកាន់ទីតាំងណា?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏙 ភ្នំពេញ", callback_data: "loc_PhnomPenh" }, { text: "🛣 តាមបណ្តាខេត្ត", callback_data: "loc_Province" }]
        ]
      }
    });
  }
});

// ជំហានទី ៣៖ ទទួលយកទីតាំង រួចទាមទារអាសយដ្ឋានលម្អិត
bot.action(/loc_(.+)/, async (ctx) => {
  const state = checkoutState.get(ctx.from.id);
  if (!state) return;

  state.region = ctx.match[1] === 'PhnomPenh' ? 'ភ្នំពេញ' : 'តាមខេត្ត';
  state.step = 'WAITING_ADDRESS';
  checkoutState.set(ctx.from.id, state);

  await ctx.editMessageText(`✅ អ្នកបានជ្រើសរើស៖ **${state.region}**`, { parse_mode: 'Markdown' });
  await ctx.reply('✍️ សូមវាយបញ្ចូលអាសយដ្ឋានលម្អិតរបស់អ្នក (ឧ. ផ្ទះលេខ.. ផ្លូវ.. សង្កាត់.. ខណ្ឌ.. ឬ ស្រុក/ខេត្ត) រួចចុចបញ្ជូន៖', Markup.forceReply());
  await ctx.answerCbQuery();
});

// ជំហានទី ៤៖ ចាប់យកអត្ថបទអាសយដ្ឋាន រួចសួរក្រុមហ៊ុនដឹកជញ្ជូន
bot.on('text', async (ctx, next) => {
  const text = ctx.message.text;
  const state = checkoutState.get(ctx.from.id);

  // ប្រសិនបើគាត់ចុចម៉ឺនុយគោល យើងលុប State គាត់ចោល (រំសាយការ Checkout)
  const menuButtons = ['🛍 មើលទំនិញ', '🛒 កន្ត្រករបស់ខ្ញុំ', '📞 ទំនាក់ទំនងយើងខ្ញុំ', 'ℹ️ ព័ត៌មានហាង'];
  if (menuButtons.includes(text)) {
    checkoutState.delete(ctx.from.id);
    return next(); 
  }

  // ប្រសិនបើគាត់កំពុងស្ថិតក្នុងជំហានបញ្ជូលអាសយដ្ឋាន
  if (state && state.step === 'WAITING_ADDRESS') {
    state.address = text;
    state.step = 'WAITING_DELIVERY';
    checkoutState.set(ctx.from.id, state);

    await ctx.reply('🚚 សូមជ្រើសរើសក្រុមហ៊ុនដឹកជញ្ជូនដែលអ្នកពេញចិត្តខាងក្រោម៖', {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔴 J&T Express", callback_data: "dev_J&T Express" }, { text: "🔵 វីរៈប៊ុនថាំ (VET)", callback_data: "dev_វីរៈប៊ុនថាំ" }],
          [{ text: "🟢 កាពីតូល (Capitol)", callback_data: "dev_កាពីតូល" }, { text: "🟡 ក្រុមហ៊ុនផ្សេងៗ", callback_data: "dev_ក្រុមហ៊ុនផ្សេងៗ" }]
        ]
      }
    });
    return;
  }
  return next();
});

// ជំហានទី ៥ (ចុងក្រោយ)៖ បញ្ជាក់ការកុម្ម៉ង់ រក្សាទុកក្នុង Database និងលុបកន្ត្រក
bot.action(/dev_(.+)/, async (ctx) => {
  const state = checkoutState.get(ctx.from.id);
  if (!state) return;

  state.delivery = ctx.match[1];
  await ctx.editMessageText(`✅ អ្នកបានជ្រើសរើស៖ **${state.delivery}**`, { parse_mode: 'Markdown' });
  const msg = await ctx.reply('⏳ កំពុងដំណើរការការបញ្ជាទិញរបស់អ្នក សូមរង់ចាំបន្តិច...');

  try {
    const q = query(collection(db, 'carts'), where('userId', '==', ctx.from.id));
    const cartSnap = await getDocs(q);

    if (cartSnap.empty) return ctx.reply('កន្ត្រករបស់អ្នកទទេស្អាត។', mainMenu);

    let totalAmount = 0;
    let itemsList = '';
    const items = [];

    cartSnap.forEach(docSnap => {
      const data = docSnap.data();
      totalAmount += data.price;
      itemsList += `- ${data.productName} ($${data.price})\n`;
      items.push(data);
    });

    // រក្សាទុកក្នុង Firestore 
    await addDoc(collection(db, 'orders'), {
      userId: ctx.from.id,
      username: ctx.from.username || ctx.from.first_name,
      phone: state.phone,
      region: state.region,
      address: state.address,
      delivery: state.delivery,
      items: items,
      totalAmount: totalAmount,
      status: 'pending', // សម្រាប់ឱ្យ Admin មើល
      createdAt: serverTimestamp()
    });

    // លុបទំនិញពីកន្ត្រកវិញបន្ទាប់ពីទិញរួច
    const batchDelete = [];
    cartSnap.forEach(d => batchDelete.push(deleteDoc(doc(db, 'carts', d.id))));
    await Promise.all(batchDelete);

    // បង្ហាញវិក្កយបត្រផ្លូវការទៅអតិថិជន
    const receipt = `🎉 **ការបញ្ជាទិញទទួលបានជោគជ័យ!**\n\n` +
                    `📦 **ទំនិញដែលបានកុម្ម៉ង់៖**\n${itemsList}` +
                    `\n💵 **សរុបប្រាក់ត្រូវទូទាត់:** $${totalAmount.toFixed(2)}\n\n` +
                    `📍 **ព័ត៌មានដឹកជញ្ជូន៖**\n` +
                    `• លេខទូរស័ព្ទ: ${state.phone}\n` +
                    `• តំបន់: ${state.region}\n` +
                    `• អាសយដ្ឋាន: ${state.address}\n` +
                    `• ក្រុមហ៊ុនដឹក: ${state.delivery}\n\n` +
                    `ក្រុមការងារយើងខ្ញុំនឹងរៀបចំឥវ៉ាន់ និងទាក់ទងទៅអ្នកក្នុងពេលឆាប់ៗនេះ។ សូមអរគុណ! 🙏`;

    await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id);
    await ctx.reply(receipt, { parse_mode: 'Markdown', ...mainMenu });

    // លុបការចងចាំចោល ដើម្បីអតិថិជនអាចទិញលើកក្រោយទៀតបាន
    checkoutState.delete(ctx.from.id);

  } catch (error) {
    console.error("Order error:", error);
    ctx.reply('មានបញ្ហាក្នុងការបញ្ជាទិញ។ សូមសាកល្បងម្ដងទៀត។', mainMenu);
  }
  await ctx.answerCbQuery();
});

// ==========================================
// ៦. បង្កើត Webhook សម្រាប់ Render 
// ==========================================
if (process.env.RENDER_EXTERNAL_URL) {
  bot.launch({
    webhook: {
      domain: process.env.RENDER_EXTERNAL_URL,
      port: process.env.PORT || 10000
    }
  }).then(() => console.log('Webhook is set!\nServer is listening...'));
} else {
  bot.launch().then(() => console.log('Bot is running in Long Polling mode!'));
}

// កូដការពារកុំឱ្យ Bot គាំងពេល Render បិទបើក Server
process.once('SIGINT', () => { try { bot.stop('SIGINT'); } catch(e){} });
process.once('SIGTERM', () => { try { bot.stop('SIGTERM'); } catch(e){} });