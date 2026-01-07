module.exports = {
  apps: [{
    name: 'safewebedit-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/root/safewebedit/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    }
  }]
};
