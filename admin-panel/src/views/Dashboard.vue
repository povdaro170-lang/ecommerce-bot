<template>
  <div class="p-6 md:p-10">
    <!-- Header ខាងលើ -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">សួស្តី Admin! 👋</h1>
        <p class="text-gray-500 mt-1">នេះជារបាយការណ៍សង្ខេបសម្រាប់ថ្ងៃនេះ</p>
      </div>
      <!-- ចុចប៊ូតុងនេះ នឹងលោតទៅទំព័រទំនិញ ដើម្បីបន្ថែមថ្មី -->
      <button @click="$router.push('/products')" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        បន្ថែមទំនិញថ្មី
      </button>
    </div>

    <!-- ប្រអប់តួលេខ (Stats Cards) ដែលនឹងលោតលេខពិតប្រាកដ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <!-- កាតទី ១: ចំណូលសរុប -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-semibold mb-1">ចំណូលសរុប</p>
          <h3 class="text-2xl font-black text-gray-800">${{ totalRevenue.toFixed(2) }}</h3>
        </div>
      </div>

      <!-- កាតទី ២: ការបញ្ជាទិញ -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-semibold mb-1">ការបញ្ជាទិញ</p>
          <h3 class="text-2xl font-black text-gray-800">{{ totalOrders }}</h3>
        </div>
      </div>

      <!-- កាតទី ៣: ទំនិញក្នុងស្តុក -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-semibold mb-1">ទំនិញក្នុងស្តុក</p>
          <h3 class="text-2xl font-black text-gray-800">{{ totalProducts }}</h3>
        </div>
      </div>

    </div>
    
    <!-- តំបន់ទំនេរសម្រាប់ដាក់តារាងទិន្នន័យ (Table) នៅថ្ងៃក្រោយ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
      <p>មិនទាន់មានទិន្នន័យលម្អិតសម្រាប់ការបញ្ជាទិញនៅឡើយទេ...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const totalRevenue = ref(0);
const totalOrders = ref(0);
const totalProducts = ref(0);

onMounted(() => {
  // រាប់ចំនួនទំនិញក្នុងស្តុក តាមរយៈ Collection 'products'
  onSnapshot(collection(db, 'products'), (snap) => {
    totalProducts.value = snap.size;
  });

  // រាប់ចំនួនការបញ្ជាទិញ និងបូកប្រាក់ចំណូលសរុប តាមរយៈ Collection 'orders'
  onSnapshot(collection(db, 'orders'), (snap) => {
    totalOrders.value = snap.size;
    
    let revenue = 0;
    snap.forEach(doc => {
      const data = doc.data();
      // បូកបញ្ចូលតម្លៃ totalAmount ដែលបានមកពី Telegram Bot
      revenue += (data.totalAmount || 0);
    });
    totalRevenue.value = revenue;
  });
});
</script>