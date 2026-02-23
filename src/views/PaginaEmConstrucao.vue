<template>
  <div class="construcao-container">
    <div class="construcao-content">
      <div class="construcao-icon">
        <i class="pi pi-wrench" style="font-size: 5rem; color: #6366f1;"></i>
      </div>

      <h1 class="construcao-title">Página em Construção</h1>

      <div class="construcao-message">
        <p>Estamos trabalhando para trazer a melhor experiência para você.</p>
        <p>A página ainda está em desenvolvimento e em breve estará disponível.</p>
        <p><strong>Assim que estiver pronta, informaremos você.</strong></p>
      </div>

      <div class="construcao-footer">
        <i class="pi pi-heart-fill" style="color: #ec4899; font-size: 1.2rem;"></i>
        <span>Obrigado pela compreensão!</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginaEmConstrucao'
}
</script>

<style scoped>
.construcao-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 20px;
}

.construcao-content {
  text-align: center;
  max-width: 560px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.construcao-icon {
  margin-bottom: 28px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

.construcao-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.construcao-message {
  margin-bottom: 32px;
  line-height: 1.7;
}

.construcao-message p {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 12px;
}

.construcao-message p:last-child {
  margin-bottom: 0;
}

.construcao-message strong {
  color: #6366f1;
}

.construcao-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  font-size: 1rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .construcao-content {
    padding: 36px 24px;
  }

  .construcao-icon i {
    font-size: 4rem !important;
  }

  .construcao-title {
    font-size: 1.75rem;
  }

  .construcao-message p {
    font-size: 1rem;
  }
}
</style>
