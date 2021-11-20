// eslint-disable-next-line no-undef
db.users.update(
  { username: 'local-admin' },
  {
    $set: {
      password: 'SPLH+2c7bJCHKCPgj2EKtBAH6E8GuGicorJR4KAXJA7ig6O8dFRIKPOpc7o3R1fCjXKQRGObHiUdelpCpt3oKQ==',
      salt: 'pXeE5MbrKXxtSlQ+WjZgIQ=='
    }
  },
  { multi: true }
);

// Usuario: local-admin
// Contraseña: GcAEFZkPs5kT4K73fcS795fX7West
