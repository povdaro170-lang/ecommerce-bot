import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import Products from './views/Products.vue';
import AdminLayout from './layouts/AdminLayout.vue'; 

const routes = [
  { 
    path: '/login', 
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    // តំបន់សម្រាប់ Admin (ត្រូវបានគ្របដោយ AdminLayout)
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' }, 
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'products', name: 'Products', component: Products }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ចាក់សោទំព័រ
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;