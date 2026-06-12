<template>
  <form class="login-form" @submit.prevent="submitLogin">
    <h2>Login</h2>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        v-model="email"
        required
        autocomplete="username"
        placeholder="Enter your email"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        v-model="password"
        required
        autocomplete="current-password"
        placeholder="Enter your password"
      />
    </div>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <button type="submit" :disabled="isSubmitting">Login</button>
  </form>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isSubmitting: false,
    }
  },
  methods: {
    submitLogin() {
      this.errorMessage = ''

      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.'
        return
      }

      this.isSubmitting = true
      const payload = {
        email: this.email.trim(),
        password: this.password,
      }

      this.$emit('login', payload)

      setTimeout(() => {
        this.isSubmitting = false
      }, 300)
    },
  },
}
</script>

<style scoped>
.login-form {
  max-width: 360px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.login-form h2 {
  margin-bottom: 16px;
  font-size: 1.2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 1rem;
}

.button,
button {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.error-message {
  margin-bottom: 12px;
  color: #dc2626;
  font-size: 0.95rem;
}
</style>
