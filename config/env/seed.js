const mongoose = require('mongoose');
// Users
const managerId = mongoose.Types.ObjectId();
// Shops
const shopId = mongoose.Types.ObjectId();

module.exports = {
  seed: process.env.MONGO_SEED === 'true',
  options: {
    logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false'
  },
  // Order of collections in configuration will determine order of seeding.
  // i.e. given these settings, the User seeds will be complete before
  // Article seed is performed.
  collections: [
    {
      model: 'Group',
      docs: [
        {
          data: {
            name: 'admin',
            option: {
              articles: {
                module: true,
                '/api/articles': {
                  get: true,
                  post: true
                },
                '/api/articles/:articleId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              groups: {
                module: true,
                '/api/groups': {
                  get: true,
                  post: true
                },
                '/api/groups/listModules': {
                  get: true
                },
                '/api/groups/:groupId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              users: {
                module: true,
                '/api/users/me': {
                  get: true
                },
                '/api/users': {
                  get: true,
                  put: true
                },
                '/api/users/accounts': {
                  delete: true
                },
                '/api/users/password': {
                  post: true
                },
                '/api/users/picture': {
                  post: true
                },
                '/api/users/:userId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              auth: {
                '/api/auth/forgot': {
                  post: true
                },
                '/api/auth/reset/:token': {
                  get: true,
                  post: true
                },
                '/api/auth/signup': {
                  post: true
                },
                '/api/auth/signin': {
                  post: true
                },
                '/api/auth/:strategy': {
                  get: true
                },
                '/api/auth/signout': {
                  get: true
                },
                '/api/auth/:strategy/callback': {
                  get: true
                }
              },
              categories: {
                module: true,
                '/api/categories': {
                  get: true,
                  post: true
                },
                '/api/categories/findAll': {
                  get: true
                },
                '/api/categories/:categoryId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/categories/findCategories': {
                  get: true
                },
                '/api/categories/crafts': {
                  get: true
                }
              },
              crafts: {
                module: true,
                '/api/crafts': {
                  get: true,
                  post: true
                },
                '/api/crafts/:craftId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              craftsUsers: {
                module: false,
                '/api/craftsUsers': {
                  get: true
                },
                '/api/craftsUsers/:craftId': {
                  delete: true
                }
              },
              dataTypes: {
                module: true,
                '/api/dataTypes': {
                  get: true,
                  post: true
                },
                '/api/dataTypes/:dataTypeId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/dataTypes/findAll': {
                  get: true
                }
              },
              featureDetails: {
                module: true,
                '/api/featureDetails': {
                  get: true,
                  post: true
                },
                '/api/featureDetails/:featureDetailId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/featureDetails/findAll': {
                  get: true
                }
              },
              features: {
                module: true,
                '/api/features': {
                  get: true,
                  post: true
                },
                '/api/features/:featureId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/features/findAll': {
                  get: true
                }
              },
              files: {
                module: true,
                '/api/files': {
                  get: true,
                  post: true
                },
                '/api/files/:fileId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              historyOrders: {
                module: false,
                '/api/historyOrders': {
                  get: true,
                  post: true
                },
                '/api/historyOrders/findAll': {
                  get: true
                }
              },
              imageTypes: {
                module: true,
                '/api/imageTypes': {
                  get: true,
                  post: true
                },
                '/api/imageTypes/:imageTypeId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              langs: {
                module: true,
                '/api/langs': {
                  get: true,
                  post: true
                },
                '/api/langs/:langId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/langs/getFileLang': {
                  get: true
                }
              },
              movements: {
                module: true,
                '/api/movements': {
                  get: true,
                  post: true
                },
                '/api/movements/:movementId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/movements/findAll': {
                  get: true
                }
              },
              orders: {
                module: true,
                '/api/orders': {
                  get: true,
                  post: true
                },
                '/api/orders/:orderId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/orders/findAll': {
                  get: true
                }
              },
              products: {
                module: true,
                '/api/products': {
                  get: true,
                  post: true
                },
                '/api/products/:productId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/products/findAll': {
                  get: true
                },
                '/api/products/getProducts': {
                  get: true
                },
                '/api/products/getSectionsByCategory': {
                  get: true
                }
              },
              shippers: {
                module: true,
                '/api/shippers': {
                  get: true,
                  post: true
                },
                '/api/shippers/:shipperId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/shippers/findAll': {
                  get: true
                }
              },
              taxes: {
                module: true,
                '/api/taxes': {
                  get: true,
                  post: true
                },
                '/api/taxes/:taxId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/taxes/findAll': {
                  get: true
                }
              },
              thirds: {
                module: true,
                '/api/thirds': {
                  get: true,
                  post: true
                },
                '/api/thirds/:thirdId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/thirds/findAll': {
                  get: true
                }
              },
              shops: {
                module: true,
                '/api/shops': {
                  get: true,
                  post: true
                },
                '/api/shops/:shopId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/shops/findAll': {
                  get: true
                }
              },
              managerFiles: {
                module: true,
                '/api/managerFiles': {
                  get: true,
                  post: true
                },
                '/api/managerFiles/uploadFile': {
                  post: true
                },
                '/api/managerFiles/:managerFileId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/managerFiles/removeAllFiles': {
                  delete: true
                }
              },
              aliases: {
                module: true,
                '/api/aliases': {
                  get: true,
                  post: true
                },
                '/api/aliases/:aliasId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/aliases/findAll': {
                  get: true
                }
              },
              priceLists: {
                module: true,
                '/api/priceLists': {
                  get: true,
                  post: true
                },
                '/api/priceLists/findAll': {
                  get: true
                },
                '/api/priceLists/:priceListId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              discountLists: {
                module: true,
                '/api/discountLists': {
                  get: true,
                  post: true
                },
                '/api/discountLists/findAll': {
                  get: true
                },
                '/api/discountLists/:discountListId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              managerConfigurations: {
                module: true,
                '/api/managerConfigurations': {
                  get: true,
                  post: true
                },
                '/api/managerConfigurations/:managerConfigurationId': {
                  get: true,
                  put: true,
                  delete: true
                }
              }
            }
          }
        },
        {
          data: {
            name: 'manager',
            option: {
              aliases: {
                module: false,
                '/api/aliases': {
                  get: true
                },
                '/api/aliases/findAll': {
                  get: true
                }
              },
              categories: {
                module: true,
                '/api/categories': {
                  get: true,
                  post: true
                },
                '/api/categories/:categoryId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/categories/crafts': {
                  get: true
                },
                '/api/categories/findAll': {
                  get: true
                },
                '/api/categories/findCategories': {
                  get: true
                }
              },
              crafts: {
                module: true,
                '/api/crafts': {
                  get: true,
                  post: true
                },
                '/api/crafts/:craftId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              craftsUsers: {
                module: false,
                '/api/craftsUsers': {
                  get: true
                },
                '/api/craftsUsers/:craftId': {
                  delete: true
                }
              },
              dataTypes: {
                module: false,
                '/api/dataTypes': {
                  get: true
                },
                '/api/dataTypes/getShippers': {
                  get: true
                },
                '/api/dataTypes/getPurchaseStatus': {
                  get: true
                },
                '/api/dataTypes/:dataTypeId': {
                  get: true
                },
                '/api/dataTypes/findAll': {
                  get: true
                }
              },
              discountLists: {
                module: true,
                '/api/discountLists': {
                  get: true,
                  post: true
                },
                '/api/discountLists/findAll': {
                  get: true
                },
                '/api/discountLists/:discountListId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              featureDetails: {
                module: true,
                '/api/featureDetails': {
                  get: true,
                  post: true
                },
                '/api/featureDetails/:featureDetailId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/featureDetails/findAll': {
                  get: true
                }
              },
              features: {
                module: true,
                '/api/features': {
                  get: true,
                  post: true
                },
                '/api/features/:featureId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/features/findAll': {
                  get: true
                }
              },
              groups: {
                module: false,
                '/api/groups': {
                  get: true
                },
                '/api/groups/listModules': {
                  get: true
                },
                '/api/groups/:groupId': {
                  get: true
                }
              },
              langs: {
                module: true,
                '/api/langs': {
                  get: true,
                  post: true
                },
                '/api/langs/:langId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/langs/getFileLang': {
                  get: true
                }
              },
              managerConfigurations: {
                module: true,
                '/api/managerConfigurations': {
                  get: true,
                  post: true
                },
                '/api/managerConfigurations/:managerConfigurationId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              managerFiles: {
                module: false,
                '/api/managerFiles': {
                  get: true,
                  post: true
                },
                '/api/managerFiles/uploadFile': {
                  post: true
                },
                '/api/managerFiles/:managerFileId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/managerFiles/removeAllFiles': {
                  delete: true
                }
              },
              movements: {
                module: true,
                '/api/movements': {
                  get: true,
                  post: true
                },
                '/api/movements/:movementId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/movements/findAll': {
                  get: true
                },
                '/api/movements/findMovement': {
                  get: true
                },
                '/api/movements/findDetail': {
                  get: true
                }
              },
              historyOrders: {
                module: false,
                '/api/historyOrders': {
                  get: true,
                  post: true
                },
                '/api/historyOrders/findAll': {
                  get: true
                }
              },
              orders: {
                module: true,
                '/api/orders': {
                  get: true,
                  post: true
                },
                '/api/orders/:orderId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/orders/findAll': {
                  get: true
                }
              },
              products: {
                module: true,
                '/api/products': {
                  get: true,
                  post: true
                },
                '/api/products/:productId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/products/findAll': {
                  get: true
                },
                '/api/products/getProducts': {
                  get: true
                },
                '/api/products/getSectionsByCategory': {
                  get: true
                }
              },
              shippers: {
                module: true,
                '/api/shippers': {
                  get: true,
                  post: true
                },
                '/api/shippers/:shipperId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/shippers/findAll': {
                  get: true
                }
              },
              shops: {
                module: false,
                '/api/shops': {
                  get: true
                }
              },
              taxes: {
                module: true,
                '/api/taxes': {
                  get: true,
                  post: true
                },
                '/api/taxes/:taxId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/taxes/findAll': {
                  get: true
                }
              },
              thirds: {
                module: true,
                '/api/thirds': {
                  get: true,
                  post: true
                },
                '/api/thirds/:thirdId': {
                  get: true,
                  put: true,
                  delete: true
                },
                '/api/thirds/findAll': {
                  get: true
                }
              },
              users: {
                module: false,
                '/api/users/me': {
                  get: true
                },
                '/api/users': {
                  get: true,
                  put: true
                },
                '/api/users/accounts': {
                  delete: true
                },
                '/api/users/password': {
                  post: true
                },
                '/api/users/picture': {
                  post: true
                },
                '/api/users/:userId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              auth: {
                module: false,
                '/api/auth/forgot': {
                  post: true
                },
                '/api/auth/reset/:token': {
                  get: true,
                  post: true
                },
                '/api/auth/signup': {
                  post: true
                },
                '/api/auth/signin': {
                  post: true
                },
                '/api/auth/:strategy': {
                  get: true
                },
                '/api/auth/signout': {
                  get: true
                },
                '/api/auth/:strategy/callback': {
                  get: true
                }
              },
              files: {
                module: true,
                '/api/files': {
                  get: true,
                  post: true
                },
                '/api/files/:fileId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              imageTypes: {
                module: true,
                '/api/imageTypes': {
                  get: true,
                  post: true
                },
                '/api/imageTypes/:imageTypeId': {
                  get: true,
                  put: true,
                  delete: true
                }
              },
              priceLists: {
                module: true,
                '/api/priceLists': {
                  get: true,
                  post: true
                },
                '/api/priceLists/findAll': {
                  get: true
                },
                '/api/priceLists/:priceListId': {
                  get: true,
                  put: true,
                  delete: true
                }
              }
            }
          }
        },
        {
          data: {
            name: 'user',
            option: {
              categories: {
                '/api/categories/findCategories': {
                  get: true
                },
                '/api/categories/findAll': {
                  get: true
                },
                '/api/categories/crafts': {
                  get: true
                }
              },
              crafts: {
                '/api/crafts': {
                  get: true
                },
                '/api/crafts/:craftId': {
                  get: true
                }
              },
              dataTypes: {
                '/api/dataTypes/findAll': {
                  get: true
                }
              },
              historyOrders: {
                '/api/historyOrders/findAll': {
                  get: true
                }
              },
              movements: {
                '/api/movements/findAll': {
                  get: true
                },
                '/api/movements/findMovement': {
                  get: true
                }
              },
              orders: {
                '/api/orders': {
                  post: true
                }
              },
              products: {
                '/api/products/getProducts': {
                  get: true
                },
                '/api/products/:productId': {
                  get: true
                },
                '/api/products/getSectionsByCategory': {
                  get: true
                }
              },
              shippers: {
                '/api/shippers/findAll': {
                  get: true
                }
              },
              managerConfigurations: {
                '/api/managerConfigurations': {
                  get: true
                }
              }
            }
          }
        },
        {
          data: {
            name: 'guest',
            option: {
              products: {
                '/api/products/getProducts': {
                  get: true
                },
                '/api/products/:productId': {
                  get: true
                },
                '/api/products/getSectionsByCategory': {
                  get: true
                }
              },
              categories: {
                '/api/categories/findCategories': {
                  get: true
                },
                '/api/categories/findAll': {
                  get: true
                },
                '/api/categories/crafts': {
                  get: true
                }
              },
              crafts: {
                '/api/crafts': {
                  get: true
                },
                '/api/crafts/:craftId': {
                  get: true
                }
              },
              managerConfigurations: {
                '/api/managerConfigurations': {
                  get: true
                }
              }
            }
          }
        }
      ]
    },
    {
      model: 'User',
      docs: [
        {
          data: {
            username: 'local-admin',
            email: 'admin@localhost.com',
            phone: '0542342',
            firstName: 'Admin',
            lastName: 'Local',
            roles: ['admin'],
            DNI: '03247'
          }
        },
        {
          // Set to true to overwrite this document
          // when it already exists in the collection.
          // If set to false, or missing, the seed operation
          // will skip this document to avoid overwriting it.
          overwrite: true,
          data: {
            phone: '2349274',
            username: 'local-user',
            email: 'user@localhost.com',
            firstName: 'User',
            lastName: 'Local',
            roles: ['user'],
            DNI: '9854398'
          }
        },
        {
          data: {
            _id: managerId,
            shop_id: shopId,
            username: 'viviana',
            email: 'viviana@gmail.com',
            firstName: 'Viviana',
            lastName: 'Compusum',
            roles: ['user'],
            phone: '05782384',
            DNI: '452498'
          }
        }
      ]
    },
    {
      model: 'Alias',
      docs: [
        {
          data: {
            nameLang: 'Estado de compra',
            systemName: 'purchaseStatus',
            status: true
          }
        },
        {
          data: {
            nameLang: 'metodo de pago',
            systemName: 'paymentMethod',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Tercero',
            systemName: 'typeThird',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Documento',
            systemName: 'typeDocument',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Caracteristicas',
            systemName: 'typeFeature',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Descuento',
            systemName: 'typeDiscount',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Valor de Descuento',
            systemName: 'typeValueDiscount',
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tipo de Movimiento',
            systemName: 'typeMovement',
            status: true
          }
        }
      ]
    },
    {
      model: 'Shop',
      docs: [
        {
          data: {
            _id: shopId,
            name: 'Compusum',
            status: true,
            user_id: managerId
          }
        }
      ]
    },
    {
      model: 'DataType',
      docs: [
        {
          data: {
            nameLang: 'pendiente por pago',
            alias_id: 'purchaseStatus',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'entregado',
            alias_id: 'purchaseStatus',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'pago aceptado',
            alias_id: 'purchaseStatus',
            system: true,
            order: 3,
            status: true
          }
        },
        {
          data: {
            nameLang: 'preparación en curso',
            alias_id: 'purchaseStatus',
            system: true,
            order: 4,
            status: true
          }
        },
        {
          data: {
            nameLang: 'envíado',
            alias_id: 'purchaseStatus',
            system: true,
            order: 5,
            status: true
          }
        },
        {
          data: {
            nameLang: 'cancelado',
            alias_id: 'purchaseStatus',
            system: true,
            order: 6,
            status: true
          }
        },
        {
          data: {
            nameLang: 'error en pago',
            alias_id: 'purchaseStatus',
            system: true,
            order: 7,
            status: true
          }
        },
        {
          data: {
            nameLang: 'pendiente por comprobante',
            alias_id: 'purchaseStatus',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'Tarjeta de credito',
            alias_id: 'paymentMethod',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'Transacción',
            alias_id: 'paymentMethod',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'PSE',
            alias_id: 'paymentMethod',
            system: true,
            order: 3,
            status: true
          }
        },
        {
          data: {
            nameLang: 'Transportista',
            alias_id: 'typeThird',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'Proveedor',
            alias_id: 'typeThird',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'Fabricante',
            alias_id: 'typeThird',
            system: true,
            order: 3,
            status: true
          }
        },
        {
          data: {
            nameLang: 'NIT',
            alias_id: 'typeDocument',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'C.C',
            alias_id: 'typeDocument',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'T.I',
            alias_id: 'typeDocument',
            system: true,
            order: 3,
            status: true
          }
        },
        {
          data: {
            nameLang: 'none',
            alias_id: 'typeDiscount',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'individual',
            alias_id: 'typeDiscount',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'global',
            alias_id: 'typeDiscount',
            system: true,
            order: 3,
            status: true
          }
        },
        {
          data: {
            nameLang: 'listPrice',
            alias_id: 'typeDiscount',
            system: true,
            order: 4,
            status: true
          }
        },
        {
          data: {
            nameLang: 'value',
            alias_id: 'typeValueDiscount',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'percent',
            alias_id: 'typeValueDiscount',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'selectList',
            alias_id: 'typeFeature',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'radioList',
            alias_id: 'typeFeature',
            system: true,
            order: 2,
            status: true
          }
        },
        {
          data: {
            nameLang: 'input',
            alias_id: 'typeMovement',
            system: true,
            order: 1,
            status: true
          }
        },
        {
          data: {
            nameLang: 'output',
            alias_id: 'typeMovement',
            system: true,
            order: 2,
            status: true
          }
        }
      ]
    },
    {
      model: 'ManagerFile',
      docs: [
        {
          data: {
            fieldname: 'newProfilePicture',
            originalname: 'colombia.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: './modules/manager-files/client/files/',
            filename: 'e995cbbf996094f60d49e713744cc3cb',
            path: '/modules/manager-files/client/files/e995cbbf996094f60d49e713744cc3cb',
            size: '14877',
            shop_id: shopId
          }
        },
        {
          data: {
            fieldname: 'newProfilePicture',
            originalname: 'usa.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: './modules/manager-files/client/files/',
            filename: '63acc2e5842d85ffbd9566f77a6fda5c',
            path: '/modules/manager-files/client/files/63acc2e5842d85ffbd9566f77a6fda5c',
            size: '28895',
            shop_id: shopId
          }
        },
        {
          data: {
            fieldname: 'newProfilePicture',
            originalname: 'begin.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            destination: './modules/manager-files/client/files/',
            filename: 'e97e2d57d1216ddf1e3f7b94ebfde9b5',
            path: '/modules/manager-files/client/files/e97e2d57d1216ddf1e3f7b94ebfde9b5',
            size: '67258',
            shop_id: shopId
          }
        }
      ]
    },
    {
      model: 'Lang',
      docs: [
        {
          data: {
            name: 'Ingles',
            isoCode: 'en-us',
            languageCode: 'en',
            fileName: 'en.json',
            locale: 'Usa',
            dateFormatLite: 'Y-m-d',
            dateFormatFull: 'Y-m-d H:i:s',
            status: 'true',
            managerFile_id: '63acc2e5842d85ffbd9566f77a6fda5c',
            shop_id: shopId
          }
        },
        {
          data: {
            name: 'Español',
            isoCode: 'es-co',
            languageCode: 'es',
            fileName: 'es.json',
            locale: 'Colombia',
            dateFormatLite: 'Y/y/y',
            dateFormatFull: 'yy/yy/YY',
            status: true,
            managerFile_id: 'e995cbbf996094f60d49e713744cc3cb',
            shop_id: shopId
          }
        }
      ]
    },
    {
      model: 'Category',
      docs: [
        {
          data: {
            order: 2,
            parent: null,
            managerFile_id: 'e97e2d57d1216ddf1e3f7b94ebfde9b5',
            outstanding: true,
            shop_id: shopId,
            status: true,
            categoryLang: [
              {
                languageCode: 'es',
                name: 'Inicio',
                description: 'Descripción de inicio',
                linkRewrite: 'Enlace SEO de Inicio',
                metaTitle: 'Titulo SEO de inicio',
                metaKeywords: 'Palabra clave de inicio',
                metaDescription: 'Descripción SEO de inicio'
              },
              {
                languageCode: 'en',
                name: 'Begin',
                description: 'Description Begin',
                linkRewrite: 'Link SEO Begin',
                metaTitle: 'Title SEO Begin',
                metaKeywords: 'Keyword SEO Begin',
                metaDescription: 'Description SEO Begin'
              }
            ],
            ancestors: []
          }
        }
      ]
    }
  ]
};
