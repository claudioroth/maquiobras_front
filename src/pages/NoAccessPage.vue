<template>
  <div class="no-access-container">
    <img src="../assets/img/logo_white.png" alt="Logo" class="logo" />
    <h1>Sin acceso para este perfil</h1>
  </div>
</template>

<script>
export default {
  name: 'NoAccessPage',
};
</script>

<style scoped>
.no-access-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  text-align: center;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  color: #333;
}
</style>
