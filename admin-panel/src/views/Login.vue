<template>
  <div class="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-blue-50 p-6">
    <div class="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-10 transform transition-all duration-300">
      
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 transform -rotate-3">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 tracking-tight">ចូលគណនី</h2>
        <p class="mt-2 text-sm text-gray-500 font-medium">សូមបញ្ចូលព័ត៌មាន ដើម្បីចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង</p>
      </div>

      <!-- បង្ហាញសារ Error (ប្រសិនបើមាន) -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
        {{ errorMessage }}
      </div>

      <form class="space-y-5" @submit.prevent="handleLogin">
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">អ៊ីមែល (Email)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
            </div>
            <input 
              v-model="email" 
              type="email" 
              required 
              :disabled="isLoading"
              class="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none disabled:opacity-50" 
              placeholder="admin@example.com" 
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">ពាក្យសម្ងាត់ (Password)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input 
              v-model="password" 
              type="password" 
              required 
              :disabled="isLoading"
              class="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none disabled:opacity-50" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">ចូលប្រើប្រាស់</span>
          <span v-else class="flex items-center gap-2">
            <!-- Icon វិលៗ ពេលកំពុងផ្ទុក -->
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            កំពុងផ្ទៀងផ្ទាត់...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Import មុខងារពី Firebase SDK
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // ត្រូវប្រាកដថា Path នេះត្រូវទៅកាន់ File firebase.js របស់អ្នក

const router = useRouter();
const auth = getAuth(); // ហៅយកមុខងារ Authentication

// អថេរសម្រាប់ផ្ទុកទិន្នន័យ
const email = ref('');
const password = ref('');
const isLoading = ref(false); // សម្រាប់កំណត់ស្ថានភាពប៊ូតុង
const errorMessage = ref(''); // សម្រាប់បង្ហាញសារកំហុស

// មុខងារពេលចុចប៊ូតុង "ចូលប្រើប្រាស់"
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // ១. ព្យាយាម Login ជាមួយ Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // ២. បន្ទាប់ពី Login ជោគជ័យ ទៅឆែកមើលសិទ្ធិ (Role) នៅក្នុង Firestore
    // យើងទៅមើល Document នៅក្នុង Collection 'users' ដែលមាន ID ស្មើនឹង user.uid
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      // ៣. ពិនិត្យមើលថាតើមាន Role ជា Admin ឬអត់?
      if (userData.role === 'admin') {
        // រក្សាទុកស្ថានភាព Login ក្នុង LocalStorage ដើម្បីងាយស្រួលការពារ Route
        localStorage.setItem('isAuthenticated', 'true');
        // បើជា Admin គឺអនុញ្ញាតឱ្យលោតទៅទំព័រ Dashboard
        router.push('/dashboard');
      } else {
        // បើមិនមែន Admin ទោះបី Login ត្រូវក៏បណ្តេញចេញវិញ
        auth.signOut();
        errorMessage.value = 'គណនីនេះមិនមានសិទ្ធិជាអ្នកគ្រប់គ្រង (Admin) ទេ។';
      }
    } else {
      // ករណីរកមិនឃើញទិន្នន័យក្នុង Firestore (ភ្លេចបង្កើត Document)
      auth.signOut();
      errorMessage.value = 'មិនអាចស្វែងរកទិន្នន័យអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។';
    }

  } catch (error) {
    // ចាប់យក Error ពេលវាយ Email ឬ Password ខុស
    console.error("Login Error:", error.code);
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage.value = 'អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។';
        break;
      case 'auth/too-many-requests':
        errorMessage.value = 'អ្នកបានសាកល្បងខុសច្រើនដងពេក។ សូមរង់ចាំបន្តិច រួចសាកល្បងម្តងទៀត។';
        break;
      case 'auth/network-request-failed':
        errorMessage.value = 'មានបញ្ហាអ៊ីនធឺណិត។ សូមពិនិត្យមើលការភ្ជាប់របស់អ្នក។';
        break;
      default:
        errorMessage.value = 'មានបញ្ហាក្នុងការចូលគណនី។ សូមសាកល្បងម្តងទៀត។';
    }
  } finally {
    // បិទ Icon វិលៗ ពេលដំណើរការចប់ (ទោះជោគជ័យក្តី ឬ បរាជ័យក្តី)
    isLoading.value = false;
  }
};
</script>