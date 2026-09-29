import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        updates: path.resolve(__dirname, 'updates/index.html'),
        resetPassword: path.resolve(__dirname, 'reset-password/index.html'),
        changeEmail: path.resolve(__dirname, 'change-email/index.html'),
        reauthenticate: path.resolve(__dirname, 'reauthenticate/index.html'),
        reauthentication: path.resolve(__dirname, 'reauthentication/index.html'),
        magicLink: path.resolve(__dirname, 'magic-link/index.html'),
        otp: path.resolve(__dirname, 'otp/index.html'),
        invite: path.resolve(__dirname, 'invite/index.html'),
        inviteUser: path.resolve(__dirname, 'invite-user/index.html'),
        confirmSignup: path.resolve(__dirname, 'confirm-signup/index.html'),
      },
    },
  },
});
