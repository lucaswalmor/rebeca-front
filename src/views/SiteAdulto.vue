<template>
  <div class="adult-site-container">
    <div class="adult-site-content">
      <div class="warning-icon">
        <i class="pi pi-exclamation-triangle" style="font-size: 4rem; color: #f5cee1;"></i>
      </div>

      <h1 class="warning-title">Conteúdo Adulto Explícito</h1>

      <div class="warning-message">
        <p>Este site contém material de natureza adulta e explícita.</p>
        <p>É destinado exclusivamente a maiores de 18 anos.</p>
        <p>Ao continuar, você confirma que tem 18 anos ou mais.</p>
      </div>

      <div class="buttons-container d-flex justify-content-between gap-2">
        <Button label="Tenho menos de 18 anos - SAIR" class="p-button-danger p-button-lg text-xs" @click="sair"
          size="small" />
        <Button label="Tenho 18 anos ou mais - ENTRAR" class="p-button-success p-button-lg text-xs" @click="entrar"
          size="small" />
      </div>
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button';

export default {
  name: 'SiteAdulto',
  components: {
    Button
  },
  methods: {
    entrar() {
      // Redirecionar para a página inicial atual (HomeView)
      this.$router.push('/home');
    },
    sair() {
      // Redirecionar para o Google
      window.location.href = 'https://www.google.com';
    }
  }
}
</script>

<style scoped>
.adult-site-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
}

.adult-site-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.warning-icon {
  margin-bottom: 30px;
}

.warning-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.warning-message {
  margin-bottom: 40px;
  line-height: 1.6;
}

.warning-message p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
}

.enter-button:hover {
  background: linear-gradient(45deg, #45a049, #4CAF50);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.exit-button {
  min-width: 300px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  background: linear-gradient(45deg, #f44336, #d32f2f);
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.exit-button:hover {
  background: linear-gradient(45deg, #d32f2f, #f44336);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
}

@media (max-width: 768px) {
  .adult-site-content {
    padding: 30px 20px;
  }

  .warning-title {
    font-size: 2rem;
  }

  .warning-message p {
    font-size: 1rem;
  }

  .enter-button,
  .exit-button {
    min-width: 250px;
    padding: 12px 20px;
    font-size: 1rem;
  }
}
</style>