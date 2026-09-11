<template>
  <div class="p-6 md:p-10">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">ទំនិញ (Products) 📦</h1>
        <p class="text-gray-500 mt-1">គ្រប់គ្រងទំនិញក្នុងស្តុករបស់អ្នក</p>
      </div>
      <button @click="showAddModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        បន្ថែមថ្មី
      </button>
    </div>

    <!-- បញ្ជីទំនិញ -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4">
        <img :src="product.imageUrl || 'https://via.placeholder.com/150'" class="w-24 h-24 object-cover rounded-xl border border-gray-100" />
        <div>
          <h3 class="font-bold text-lg text-gray-800">{{ product.name }}</h3>
          <p class="text-blue-600 font-black mt-1">${{ product.price }}</p>
          <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ product.description }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="products.length === 0" class="text-center text-gray-400 mt-10">មិនទាន់មានទំនិញនៅឡើយទេ...</div>

    <!-- ផ្ទាំងបញ្ជូលទំនិញ (Modal) -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">បន្ថែមទំនិញថ្មី</h2>
        <form @submit.prevent="addProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">ឈ្មោះទំនិញ</label>
            <input v-model="newProduct.name" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ឧ. កាហ្វេទឹកដោះគោ" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">តម្លៃ ($)</label>
            <input v-model="newProduct.price" type="number" step="0.01" required class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2.50" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">ពណ៌នា (Description)</label>
            <textarea v-model="newProduct.description" rows="2" class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ព័ត៌មានលម្អិត..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Link រូបភាព (Image URL)</label>
            <input v-model="newProduct.imageUrl" type="text" class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
          <div class="flex gap-4 mt-8">
            <button type="button" @click="showAddModal = false" class="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">បោះបង់</button>
            <button type="submit" :disabled="isSaving" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">រក្សាទុក</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const products = ref([]);
const showAddModal = ref(false);
const isSaving = ref(false);

const newProduct = ref({
  name: '',
  price: '',
  description: '',
  imageUrl: ''
});

// ទាញយកទិន្នន័យ (Real-time)
onMounted(() => {
  onSnapshot(collection(db, 'products'), (snapshot) => {
    products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

// បញ្ចូលទំនិញថ្មី
const addProduct = async () => {
  isSaving.value = true;
  try {
    await addDoc(collection(db, 'products'), {
      name: newProduct.value.name,
      price: parseFloat(newProduct.value.price),
      description: newProduct.value.description,
      imageUrl: newProduct.value.imageUrl || 'https://via.placeholder.com/150',
      createdAt: serverTimestamp()
    });
    showAddModal.value = false;
    newProduct.value = { name: '', price: '', description: '', imageUrl: '' }; // Clear form
  } catch (error) {
    console.error("Error adding product: ", error);
  } finally {
    isSaving.value = false;
  }
};
</script>