// Manager Files service used to communicate Manager Files REST endpoints
(function () {
  'use strict';

  angular.module('managerFiles.services').factory('ManagerFilesService', ManagerFilesService);

  ManagerFilesService.$inject = ['$q', '$resource', '$log', 'Upload'];

  function ManagerFilesService($q, $resource, $log, Upload) {
    var ManagerFiles = $resource(
      '/api/managerFiles/:managerFileId',
      {
        managerFileId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(ManagerFiles.prototype, {
      createOrUpdate: function () {
        var managerFile = this;
        return createOrUpdate(managerFile);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/managerFiles/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        var modules = $resource('/api/shops', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      removeAllFiles: function (params, callback) {
        console.log(params.id);
        var modules = $resource('/api/managerFiles/removeAllFiles', { data: params.id });
        modules.remove({}, function (rst) {
          callback(rst);
        });
      },
      createOrUpdateFile: function (params) {
        if (!params.multiFiles && params.files) {
          var files = [];
          files.push(params.files);
          params.files = files;
        }

        if (!params.id) {
          return createFile(params);
        } else if (params.files && params.files.length > 0) {
          return updateFile(params);
        } else {
          return defaultFile(params);
        }
      }
    });

    return ManagerFiles;

    function createOrUpdate(managerFile) {
      if (managerFile._id) {
        return managerFile.$update(onSuccess, onError);
      } else {
        return managerFile.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(managerFile) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function createFile(params) {
      var loopPromises = [];

      angular.forEach(params.files, function (file, key) {
        var deferred = $q.defer();
        loopPromises.push(deferred.promise);

        if (file.old === 'true') {
          deferred.resolve({ response: true, error: false, data: file });
        } else {
          Upload.upload({
            url: '/api/managerFiles',
            data: {
              newProfilePicture: file
            }
          })
            .then(function (response) {
              deferred.resolve({ response: true, error: false, data: response.data });
            })
            .catch(function (errorCreate) {
              deferred.reject({ response: true, error: false, data: errorCreate });
            });
        }
      });
      return $q.all(loopPromises);
    }

    function updateFile(params) {
      return $q(function (resolve, reject) {
        var arrayValueNew = [];
        var arrayValueOld = [];
        var arrayDeleted = [];

        angular.forEach(params.files, function (value, key) {
          if (Upload.isFile(value)) {
            value.old = 'false';
            arrayValueNew.push(value);
          } else {
            value.old = 'true';
            arrayValueOld.push(value);
            arrayValueNew.push(value);
          }
        });

        angular.forEach(params.id, function (valueX, keyX) {
          var findTrue = false;
          angular.forEach(arrayValueOld, function (valueY, keyY) {
            if (valueX._id === valueY._id) {
              findTrue = true;
            }
          });
          if (!findTrue) {
            arrayDeleted.push(valueX);
          }
        });

        params.id = arrayDeleted;
        params.files = arrayValueNew;

        ManagerFiles.prototype.removeAllFiles(params, function (rstRemoveFiles) {
          resolve(createFile(params));
        });
      });
    }

    function defaultFile(params) {
      var loopPromises = [];
      angular.forEach(params.id, function (file, key) {
        var deferred = $q.defer();
        loopPromises.push(deferred.promise);
        deferred.resolve({ response: true, error: false, data: file });
      });
      return $q.all(loopPromises);
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
})();
