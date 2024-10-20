import { SessionStorage } from "quasar";

const checkRoleAccess = (requiredRoles, next) => {
  const userRole = SessionStorage.getItem("rol");

  if (userRole && requiredRoles.includes(parseInt(userRole))) {
    next();
  } else {
    next("/no-access");
  }
};

const routes = [
  {
    path: "/",
    beforeEnter: (to, from, next) => {
      const useUser = SessionStorage.getItem("user");
      const usePassword = SessionStorage.getItem("password");
      const userBranch = SessionStorage.getItem("branch");
      const rol = SessionStorage.getItem("rol");
      !useUser && !usePassword && !rol && !userBranch
        ? next({ path: "/login" })
        : next();
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("../pages/StockMovement.vue") },
      {
        path: "StockMovement",
        component: () => import("../pages/StockMovement.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([1, 2], next),
      },
      {
        path: "ABMProd",
        component: () => import("pages/ABMProd.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([1], next),
      },
      {
        path: "ABMUser",
        component: () => import("pages/ABMUser.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([1, 2], next),
      },
      {
        path: "ProductEntry",
        component: () => import("pages/ProductEntry.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([1, 2, 3], next),
      },
      {
        path: "StockBranch",
        component: () => import("pages/StockBranch.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([2, 3], next),
      },
      {
        path: "SaleProducts",
        component: () => import("pages/SaleProducts.vue"),
        beforeEnter: (to, from, next) => checkRoleAccess([1, 2, 3], next),
      },
      {
        path: "no-access",
        component: () => import("pages/NoAccessPage.vue"),
      },
    ],
  },
  {
    path: "/login",
    beforeEnter: (to, from, next) => {
      const useUser = SessionStorage.getItem("user");
      const userPassword = SessionStorage.getItem("password");
      const userBranch = SessionStorage.getItem("branch");
      const rol = SessionStorage.getItem("rol");
      !useUser && !userPassword && !rol && !userBranch
        ? next()
        : next(from.fullPath);
    },
    name: "Login",
    component: () => import("../pages/Login.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

