<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
    
    <!-- ១. Desktop Sidebar (បង្ហាញតែកុំព្យូទ័រ លាក់លើទូរស័ព្ទ) -->
    <aside class="hidden md:flex flex-col w-64 bg-white shadow-xl min-h-screen fixed top-0 left-0 z-20">
      <div class="h-20 flex items-center justify-center border-b border-gray-100">
        <h1 class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">eCom Bot</h1>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 mt-4">
        <!-- ម៉ឺនុយ Dashboard -->
        <router-link to="/dashboard" active-class="bg-blue-50 text-blue-600 border-blue-600" class="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 border-l-4 border-transparent transition-all font-semibold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          ផ្ទាំងគ្រប់គ្រង
        </router-link>
        
        <!-- ម៉ឺនុយ ទំនិញ -->
        <router-link to="/products" active-class="bg-blue-50 text-blue-600 border-blue-600" class="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 border-l-4 border-transparent transition-all font-semibold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          ទំនិញ (Products)
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          ចាកចេញ
        </button>
      </div>
    </aside>

    <!-- ២. ផ្ទាំងបង្ហាញទិន្នន័យកណ្តាល -->
    <main class="flex-1 md:ml-64 pb-20 md:pb-8 min-h-screen relative">
      <router-view /> <!-- កូដពី Dashboard ឬ Products នឹងលោតចូលទីនេះ -->
    </main>

    <!-- ៣. Mobile Bottom Bar (បង្ហាញតែលើទូរស័ព្ទ) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-gray-100 z-50">
      <div class="flex justify-around items-center h-16 px-2">
        
        <router-link to="/dashboard" active-class="text-blue-600" class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span class="text-[10px] font-bold">ទំព័រដើម</span>
        </router-link>

        <router-link to="/products" active-class="text-blue-600" class="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <span class="text-[10px] font-bold">ទំនិញ</span>
        </router-link>

        <button @click="handleLogout" class="flex flex-col items-center justify-center w-full h-full text-red-400 hover:text-red-500 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span class="text-[10px] font-bold">ចេញ</span>
        </button>

      </div>
    </nav>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getAuth, signOut } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
</script>